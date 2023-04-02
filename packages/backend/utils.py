from functools import lru_cache
from typing import List, Dict, Union
import re
from pathlib import Path
from itertools import chain
import subprocess
from random import random

from fastapi.logger import logger
from backend.models import Word, Sentence, Section, Transcript
from backend.constants import FILE_DIR, WHISPER__MODEL
from backend.connections import collection, db

import openai
from google.cloud.firestore import DocumentReference

logger.setLevel("DEBUG")


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
            sentence = Sentence(
                start=sentence_words[0].start,
                end=sentence_words[-1].end,
                words=sentence_words,
            )
            sentences.append(sentence)
            sentence_words = []

    if sentence_words:
        sentence = Sentence(
            start=sentence_words[0].start,
            end=sentence_words[-1].end,
            words=sentence_words,
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
            section = Section(
                start=section_sentences[0].start,
                end=section_sentences[-1].end,
                sentences=section_sentences,
            )
            sections.append(section)
            section_sentences = []

    if section_sentences:
        section_sentences.append(sentences[-1])
        section = Section(
            start=section_sentences[0].start,
            end=section_sentences[-1].end,
            sentences=section_sentences,
        )
        sections.append(section)

    return sections


def transcript_from_sections(sections: List[Section]) -> Transcript:
    transcript = Transcript(sections=sections)
    return transcript


def transcript_from_srt(file_name: Path) -> Transcript:
    with open(file_name, "r") as f:
        srt_content = f.read()
    words = parse_srt_to_words(srt_content)
    sentences = accumulate_words_to_sentences(words)
    sections = accumulate_sentences_to_sections(sentences)
    transcript = transcript_from_sections(sections)
    return transcript


def convert_to_seconds(timestamp: str) -> float:
    hours, minutes, seconds_ms = timestamp.split(":")
    seconds, ms = seconds_ms.split(",")
    total_seconds = (
        int(hours) * 3600 + int(minutes) * 60 + int(seconds) + int(ms) / 1000
    )
    return round(total_seconds, 2)


@lru_cache(maxsize=None)
def get_embedding(input: str) -> List[float]:
    embed_response = openai.Embedding.create(
        input=input, model="text-embedding-ada-002"
    )
    return embed_response.data[0].embedding  # type: ignore


def get_embeddings(input: List[str]) -> List[List[float]]:
    embed_response = openai.Embedding.create(
        input=input, model="text-embedding-ada-002"
    )
    return [x.embedding for x in embed_response.data]  # type: ignore


def process_video(vid: str, uid: str, doc: DocumentReference):
    logger.info(f"Processing video {vid} in collection {uid}")

    logger.info("Extracting audio")
    file_name = (FILE_DIR / vid).with_suffix(".mp4")
    vid = file_name.stem
    wav_name = file_name.with_suffix(".wav")
    extract_wav_from_mp4(file_name, wav_name)
    logger.info(f"Extracted audio to {wav_name}")
    doc.update({"progress": random() * 0.2 + 0.2})

    logger.info("Extracting transcript using whisperx")
    cmd = f"whisperx {wav_name} --hf_token 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 --vad_filter True --model {WHISPER__MODEL} --output_dir {FILE_DIR} --output_format srt-word"
    result = subprocess.run(cmd, shell=True)
    if result.returncode != 0:
        raise Exception(f"Whisperx failed.")
    logger.info(f"Whispered transcript to {(FILE_DIR / vid).with_suffix('.word.srt')}")
    doc.update({"progress": random() * 0.1 + 0.7})

    logger.info("Creating transcript object")
    srt_file = file_name.with_suffix(".word.srt")
    with open(srt_file, "r") as f:
        srt_content = f.read()
    words = parse_srt_to_words(srt_content)
    sentences = accumulate_words_to_sentences(words)
    sections = accumulate_sentences_to_sections(sentences)
    transcript = transcript_from_sections(sections)
    logger.info("Created transcript object")
    doc.update({"progress": random() * 0.1 + 0.8})

    logger.info("Upserting transcript to firestore")
    doc.update({"transcript": transcript.dict()})
    doc.update({"words": [x.dict() for x in words]})
    doc.update({"sentences": [x.dict() for x in sentences]})
    doc.update({"sections": [x.dict() for x in sections]})
    doc.update({"progress": 1, "done": True})
    logger.info("Upserted transcript to firestore")

    logger.info("Generating vectors")
    sections = transcript.sections
    sentences = list(chain.from_iterable([section.sentences for section in sections]))

    sentence_embeddings = get_embeddings([sentence.content for sentence in sentences])
    sentence_metadatas: list[dict[str, str]] = [
        {"uid": uid, "vid": vid, "type": "sentence"} for _ in sentences
    ]
    sentence_ids = [f"{vid}_sentence_{i}" for i in range(len(sentences))]
    logger.info("Generated vectors")

    section_embeddings = get_embeddings([section.content for section in sections])
    section_metadatas: list[dict[str, str]] = [
        {"uid": uid, "vid": vid, "type": "section"} for _ in sections
    ]
    section_ids = [f"{vid}_section_{i}" for i in range(len(sections))]

    logger.info("Upserting vectors")
    print(collection.count())
    collection.add(
        embeddings=sentence_embeddings,
        metadatas=sentence_metadatas,  # type: ignore
        ids=sentence_ids,
    )

    collection.add(
        embeddings=section_embeddings,
        metadatas=section_metadatas,  # type: ignore
        ids=section_ids,
    )
    print(collection.count())
    logger.info("Upserted vectors")

    return "lgtm"


class TranscriptCache:
    def __init__(self):
        self.cache = {}

    def get(self, key):
        return self.cache.get(key)

    def set(self, key, value):
        self.cache[key] = value


transcript_cache = TranscriptCache()


def get_file(vid, transcript_cache=transcript_cache):
    # Check if the file is already in the local cache
    doc = transcript_cache.get(vid)
    if doc is not None:
        return doc
    logger.warning(f"File {vid} not in cache, fetching from firestore")

    doc_ref = db.collection("videos").document(vid)
    doc = doc_ref.get().to_dict()

    # Update the local cache with the fetched file
    transcript_cache.set(vid, doc)

    return doc


def query_vector_db(
    query: str,
    where: Union[Dict[str, str], None] = None,
    count: int = 5,
    collection=collection,
):
    query_embedding = get_embedding(query)

    try:
        if where:
            results = collection.query(
                query_embedding,
                n_results=count,
                where=where,  # type: ignore
            )
        else:
            results = collection.query(
                query_embedding,
                n_results=count,
            )
        return results["ids"][0]
    except Exception as e:
        logger.error(f"Vector db query failed: {e}")
        return []
