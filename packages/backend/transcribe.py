import os
from typing import Union

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
from whisperx.asr import transcribe, transcribe_with_vad
from whisperx.diarize import DiarizationPipeline, assign_word_speakers
from whisperx.utils import get_writer
from whisperx.vad import load_vad_model
from pyannote.audio import Pipeline
from pyannote.audio import Model, Pipeline
from whisper import available_models

from backend.constants import WHISPER__MODEL, FILE_DIR


def transcribe(audio_path: str):
    args = {
        "verbose": True,
        "task": "transcribe",
        "language": None,
        "align_model": None,
        "align_extend": 2,
        "align_from_prev": True,
        "interpolate_method": "nearest",
        "vad_filter": True,
        "vad_onset": 0.500,
        "vad_offset": 0.363,
        "diarize": False,
        "min_speakers": None,
        "max_speakers": None,
        "best_of": 5,
        "beam_size": 5,
        "patience": None,
        "length_penalty": None,
        "suppress_tokens": "-1",
        "initial_prompt": None,
        "condition_on_previous_text": True,  # TODO: see if this slows down model
        "fp16": True,
        "temperature_increment_on_fallback": 0.2,
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

    tmp_dir: str = args.pop("tmp_dir")
    if tmp_dir is not None:
        os.makedirs(tmp_dir, exist_ok=True)

    align_model: str = args.pop("align_model")
    align_extend: float = args.pop("align_extend")
    align_from_prev: bool = args.pop("align_from_prev")
    interpolate_method: str = args.pop("interpolate_method")

    hf_token: str = "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"
    vad_filter: bool = args.pop("vad_filter")
    vad_onset: float = args.pop("vad_onset")
    vad_offset: float = args.pop("vad_offset")

    diarize: bool = args.pop("diarize")
    min_speakers: int = args.pop("min_speakers")
    max_speakers: int = args.pop("max_speakers")

    vad_model = load_vad_model(
        torch.device(device), vad_onset, vad_offset, use_auth_token=hf_token
    )

    if diarize:
        if hf_token is None:
            print(
                "Warning, no --hf_token used, needs to be saved in environment variable, otherwise will throw error loading diarization model..."
            )
        diarize_model = DiarizationPipeline(use_auth_token=hf_token)
    else:
        diarize_model = None

    align_language = "en"
    align_model, align_metadata = load_align_model(
        align_language, device, model_name=align_model
    )

    temperature = 0
    if (increment := args.pop("temperature_increment_on_fallback")) is not None:
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
    if vad_model is not None:
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
            model, input_audio_path, vad_model, temperature=temperature, **args
        )
    else:
        print(">>Performing transcription...")
        result = transcribe(model, input_audio_path, temperature=temperature, **args)

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

    # >> Diarize
    if diarize_model is not None:
        diarize_segments = diarize_model(
            input_audio_path, min_speakers=min_speakers, max_speakers=max_speakers
        )
        results_segments, word_segments = assign_word_speakers(
            diarize_segments, result["segments"]
        )
        result = {"segments": results_segments, "word_segments": word_segments}

    writer(result, audio_path)

    # cleanup
    if input_audio_path != audio_path:
        os.remove(input_audio_path)
