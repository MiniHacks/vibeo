from pathlib import Path
import subprocess
from typing import List
import re
from pydantic import BaseModel

from fastapi import FastAPI

app = FastAPI()


class Word(BaseModel):
    start: float
    end: float
    content: str


def parse_srt_to_words(srt_content: str) -> List[Word]:
    pattern = r"(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\n(.+)"
    matches = re.findall(pattern, srt_content)
    words = []
    for start, end, content in matches:
        start_seconds = convert_to_seconds(start)
        end_seconds = convert_to_seconds(end)
        word = Word(start=start_seconds, end=end_seconds, content=content)
        words.append(word)

    return words


class Sentence(BaseModel):
    start: float
    end: float
    content: str


def accumulate_words_to_sentences(
    words: List[Word], end_chars: str = ".!?"
) -> List[Sentence]:
    sentences = []
    sentence_words = []

    for word in words:
        sentence_words.append(word)
        if word.content[-1] in end_chars:
            sentence_content = " ".join(w.content for w in sentence_words)
            sentence = Sentence(
                start=sentence_words[0].start,
                end=sentence_words[-1].end,
                content=sentence_content,
            )
            sentences.append(sentence)
            sentence_words = []

    if sentence_words:
        sentence_content = " ".join(w.content for w in sentence_words)
        sentence = Sentence(
            start=sentence_words[0].start,
            end=sentence_words[-1].end,
            content=sentence_content,
        )
        sentences.append(sentence)

    return sentences


class Section(BaseModel):
    start: float
    end: float
    content: str


def accumulate_sentences_to_sections(
    sentences: List[Sentence], gap_threshold: float = 2.0
) -> List[Section]:
    sections = []
    section_sentences = []

    for i, sentence in enumerate(sentences[:-1]):
        section_sentences.append(sentence)
        gap = sentences[i + 1].start - sentence.end

        if gap > gap_threshold:
            section_content = " ".join(s.content for s in section_sentences)
            section = Section(
                start=section_sentences[0].start,
                end=section_sentences[-1].end,
                content=section_content,
            )
            sections.append(section)
            section_sentences = []

    if section_sentences:
        section_sentences.append(sentences[-1])
        section_content = " ".join(s.content for s in section_sentences)
        section = Section(
            start=section_sentences[0].start,
            end=section_sentences[-1].end,
            content=section_content,
        )
        sections.append(section)

    return sections


def convert_to_seconds(timestamp: str) -> float:
    hours, minutes, seconds_ms = timestamp.split(":")
    seconds, ms = seconds_ms.split(",")
    total_seconds = (
        int(hours) * 3600 + int(minutes) * 60 + int(seconds) + int(ms) / 1000
    )
    return round(total_seconds, 2)


def extract_wav_from_mp4(input_mp4: Path, output_wav: Path):
    cmd = f"ffmpeg -i {input_mp4} -vn -acodec pcm_s16le -ar 16000 -ac 1 -loglevel error -y {output_wav}"
    subprocess.run(cmd, shell=True)


FILE_DIR = Path("backend/test_files/")


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/process")
async def process(vid: str, uid: str):
    file_name = (FILE_DIR / vid).with_suffix(".mp4")
    wav_name = file_name.with_suffix(".wav")
    extract_wav_from_mp4(file_name, wav_name)
    cmd = f"whisperx {wav_name} --hf_token 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 --vad_filter --model tiny.en --output_dir {FILE_DIR} --output_type srt-word"
    subprocess.run(cmd, shell=True)

    srt_file = file_name.with_suffix(".wav.word.srt")
    with srt_file.open("r") as f:
        srt_content = f.read()
        words = parse_srt_to_words(srt_content)
        sentences = accumulate_words_to_sentences(words)
        sections = accumulate_sentences_to_sections(sentences)

        for x in sentences:
            print(x.content)
        print(sections)

        print(
            f"{len(words)} words, {len(sentences)} sentences, {len(sections)} sections"
        )
    return "lgtm"
