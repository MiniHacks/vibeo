import os
from typing import Union, Optional

import numpy as np
import torch
import ffmpeg
from whisper.tokenizer import LANGUAGES, TO_LANGUAGE_CODE
from whisper.audio import SAMPLE_RATE
from whisper.utils import (
    optional_float,
    optional_int,
    str2bool,
)
from whisperx.alignment import load_align_model, align
from whisperx.asr import transcribe
from whisperx.diarize import DiarizationPipeline, assign_word_speakers
from whisperx.utils import get_writer
from whisperx.vad import load_vad_model
from pyannote.audio import Pipeline
from pyannote.audio import Model, Pipeline
from whisper import available_models
from whisper.model import Whisper
import numpy as np
import torch
import tqdm
import ffmpeg
from whisper.audio import (
    N_SAMPLES,
    SAMPLE_RATE,
    CHUNK_LENGTH,
    log_mel_spectrogram,
    load_audio,
)
from whisper.utils import format_timestamp

from backend.constants import WHISPER__MODEL, FILE_DIR


def transcribe_with_vad(
    model: "Whisper",
    audio: str,
    vad_pipeline,
    **kwargs,
):
    """
    Transcribe per VAD segment
    """

    vad_segments = vad_pipeline(audio)

    # if not torch.is_tensor(audio):
    # if isinstance(audio, str):
    audio = load_audio(audio)
    audio = torch.from_numpy(audio)

    prev = 0
    output = {"segments": []}

    # merge segments to approx 30s inputs to make whisper most appropraite
    vad_segments = merge_chunks(vad_segments, chunk_size=CHUNK_LENGTH)
    if len(vad_segments) == 0:
        return output

    print(">>Performing transcription...")
    for sdx, seg_t in tqdm.tqdm(enumerate(vad_segments)):
        if verbose:
            print(
                f"~~ Transcribing VAD chunk: ({format_timestamp(seg_t['start'])} --> {format_timestamp(seg_t['end'])}) ~~"
            )
        seg_f_start, seg_f_end = int(seg_t["start"] * SAMPLE_RATE), int(
            seg_t["end"] * SAMPLE_RATE
        )
        local_f_start, local_f_end = seg_f_start - prev, seg_f_end - prev
        audio = audio[local_f_start:]  # seek forward
        seg_audio = audio[: local_f_end - local_f_start]  # seek forward
        prev = seg_f_start
        local_mel = log_mel_spectrogram(seg_audio, padding=N_SAMPLES)
        # need to pad

        result = transcribe(model, audio, mel=local_mel, verbose=verbose, **kwargs)
        seg_t["text"] = result["text"]
        output["segments"].append(
            {
                "start": seg_t["start"],
                "end": seg_t["end"],
                "language": result["language"],
                "text": result["text"],
                "seg-text": [x["text"] for x in result["segments"]],
                "seg-start": [x["start"] for x in result["segments"]],
                "seg-end": [x["end"] for x in result["segments"]],
            }
        )

    output["language"] = output["segments"][0]["language"]

    return output


def transcribe_video(audio_path: str, doc):
    args = {
        "verbose": True,
        "task": "transcribe",
        "language": None,
        "best_of": 5,
        "beam_size": 5,
        "patience": None,
        "length_penalty": None,
        "suppress_tokens": "-1",
        "initial_prompt": None,
        "condition_on_previous_text": True,
        "fp16": True,
        "compression_ratio_threshold": 2.4,
        "logprob_threshold": -1.0,
        "no_speech_threshold": 0.6,
        "word_timestamps": False,
        "prepend_punctuations": "\"'“¿([{-",
        "append_punctuations": "\"'.。,，!！?？:：”)]}、",
        "threads": 0,
    }

    model_name: str = WHISPER__MODEL
    model_dir: Union[str, None] = None
    output_dir: str = str(FILE_DIR)
    output_format: str = "srt-word"
    device: str = "cuda" if torch.cuda.is_available() else "cpu"
    # model_flush: bool = args.pop("model_flush")
    os.makedirs(output_dir, exist_ok=True)

    tmp_dir: Union[str, None] = None
    if tmp_dir is not None:
        os.makedirs(tmp_dir, exist_ok=True)

    align_model: Union[str, None] = None
    align_extend: float = 2
    align_from_prev: bool = True
    interpolate_method: str = "nearest"

    hf_token: str = "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"
    vad_onset: float = 0.5
    vad_offset: float = 0.363

    vad_model = load_vad_model(
        torch.device(device), vad_onset, vad_offset, use_auth_token=hf_token
    )

    align_language = "en"
    align_model, align_metadata = load_align_model(
        align_language, device, model_name=align_model
    )

    temperature = 0
    if (increment := 0.2) is not None:
        temperature = tuple(np.arange(temperature, 1.0 + 1e-6, increment))
    else:
        temperature = [temperature]

    if (threads := args.pop("threads")) > 0:
        torch.set_num_threads(threads)

    from whisper import load_model

    model = load_model(model_name, device=device, download_root=model_dir)

    writer = get_writer(output_format, output_dir)
    input_audio_path = audio_path
    tfile = None

    # >> VAD & ASR
    if not audio_path.endswith(".wav"):
        print(">>VAD requires .wav format, converting to wav as a tempfile...")
        # tfile = tempfile.NamedTemporaryFile(delete=True, suffix=".wav")
        audio_basename = os.path.splitext(os.path.basename(audio_path))[0]
        if tmp_dir is not None:
            input_audio_path = os.path.join(tmp_dir, audio_basename + ".wav")
        else:
            input_audio_path = os.path.join(
                os.path.dirname(audio_path), audio_basename + ".wav"
            )
        ffmpeg.input(audio_path, threads=0).output(
            input_audio_path, ac=1, ar=SAMPLE_RATE
        ).run(cmd=["ffmpeg"])
    print(">>Performing VAD...")
    result = transcribe_with_vad(
        model, input_audio_path, vad_model, doc, temperature=temperature, **args
    )

    # >> Align
    if align_model is not None and len(result["segments"]) > 0:
        if result.get("language", "en") != align_metadata["language"]:
            # load new language
            print(
                f"New language found ({result['language']})! Previous was ({align_metadata['language']}), loading new alignment model for new language..."
            )
            align_model, align_metadata = load_align_model(result["language"], device)
        print(">>Performing alignment...")
        result = align(
            result["segments"],
            align_model,
            align_metadata,
            input_audio_path,
            device,
            extend_duration=align_extend,
            start_from_previous=align_from_prev,
            interpolate_method=interpolate_method,
        )

    writer(result, audio_path)

    # cleanup
    if input_audio_path != audio_path:
        os.remove(input_audio_path)
