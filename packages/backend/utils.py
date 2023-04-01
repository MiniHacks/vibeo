from typing import List
import re
from pathlib import Path
import subprocess

from models import Word, Sentence, Section


def extract_wav_from_mp4(input_mp4: Path, output_wav: Path):
    cmd = f"ffmpeg -i {input_mp4} -vn -acodec pcm_s16le -ar 16000 -ac 1 -loglevel error -y {output_wav}"
    subprocess.run(cmd, shell=True)


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
