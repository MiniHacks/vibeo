from itertools import chain
from pathlib import Path
from random import random
from typing import List, Union
import logging
import os
import subprocess
import threading

from chromadb import Client as chroma_client
from chromadb.config import Settings
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from firebase_admin import credentials, firestore, initialize_app
from google.cloud.firestore import DocumentReference
from pytube import YouTube
import openai

from backend.models import Transcript, DownloadRequest
from backend.stream import *
from backend.utils import (
    extract_wav_from_mp4,
    transcript_from_srt,
)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

ENV_PATH = Path(__file__).parent.parent.parent.absolute().joinpath(".env")
FILE_DIR = Path(__file__).parent.parent.parent.absolute().joinpath("videos")
WHISPER__MODEL = "tiny.en"

logger.info(f"Loading environment variables from {ENV_PATH}")
load_dotenv(dotenv_path=ENV_PATH)

openai.api_key = os.environ["OPENAI_KEY"]

db_client = chroma_client(
    Settings(chroma_db_impl="duckdb+parquet", persist_directory=str(FILE_DIR))
)

collection = db_client.get_or_create_collection("transcripts")


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


# Initialize Firebase Admin
cred = credentials.Certificate(
    {
        "type": "service_account",
        "project_id": os.environ["FIREBASE_PROJECT_ID"],
        "private_key": os.environ["FIREBASE_AUTH_SECRET"].replace("\\n", "\n"),
        "client_email": os.environ["FIREBASE_CLIENT_EMAIL"],
        "token_uri": "https://oauth2.googleapis.com/token",
    }
)

initialize_app(cred)
db = firestore.client()
app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}


def process(vid: str, uid: str, doc: DocumentReference):
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
        raise HTTPException(status_code=500, detail="WhisperX failed")
    logger.info(f"Whispered transcript to {(FILE_DIR / vid).with_suffix('.word.srt')}")
    doc.update({"progress": random() * 0.1 + 0.7})

    logger.info("Creating transcript object")
    srt_file = file_name.with_suffix(".word.srt")
    transcript: Transcript = transcript_from_srt(srt_file)
    logger.info("Created transcript object")
    doc.update({"progress": random() * 0.1 + 0.8})

    logger.info("Upserting transcript to firestore")
    doc.update({"transcript": transcript.dict()})
    logger.info("Upserted transcript to firestore")
    doc.update({"progress": 1})

    logger.info("Generating vectors")
    sections = transcript.sections
    sentences = list(chain.from_iterable([section.sentences for section in sections]))

    sentence_embeddings = get_embeddings([sentence.content for sentence in sentences])
    sentence_documents = [x.content for x in sentences]
    sentence_metadatas: list[dict[str, str]] = [
        {"uid": uid, "vid": vid, "type": "sentence"} for _ in sentences
    ]
    sentence_ids = [f"{vid}_sentence_{i}" for i in range(len(sentences))]
    logger.info("Generated vectors")

    section_embeddings = get_embeddings([section.content for section in sections])
    section_documents = [x.content for x in sections]
    section_metadatas: list[dict[str, str]] = [
        {"uid": uid, "vid": vid, "type": "section"} for _ in sections
    ]
    section_ids = [f"{vid}_section_{i}" for i in range(len(sections))]

    logger.info("Upserting vectors")
    collection.add(
        embeddings=sentence_embeddings,
        documents=sentence_documents,
        metadatas=sentence_metadatas,  # type: ignore
        ids=sentence_ids,
    )

    collection.add(
        embeddings=section_embeddings,
        documents=section_documents,
        metadatas=section_metadatas,  # type: ignore
        ids=section_ids,
    )
    logger.info("Upserted vectors")

    return "lgtm"


@app.get("/search")
async def search(query: str, uid: str, vid: Union[str, None] = None):
    query_embedding = get_embedding(query)
    result = collection.query(
        query_embeddings=query_embedding, n_results=5, where={"uid": uid}
    )
    print(result)


@app.post("/download")
async def download_video(request: DownloadRequest):
    try:
        yt = YouTube(request.url)

        stream = yt.streams.filter(
            file_extension="mp4",
        ).get_highest_resolution()
        assert stream is not None

        time, doc = db.collection("videos").add(
            {
                "name": stream.title,
                "type": "youtube",
                "youtube": request.url,
                "done": False,
                "progressMessage": "Downloading",
                "progress": 0,
                "uid": request.uid,
                "created": firestore.SERVER_TIMESTAMP,
            }
        )

        vid = doc.id

        print("Downloading video", doc.id, ":", stream.title)

        def side_process():
            filename = f"{vid}.mp4"
            stream.download(output_path=str(FILE_DIR), filename=filename)

        def on_progress(strm, chunk, bytes_remaining):
            # Do something with the progress
            print("Download progress", 1 - (bytes_remaining / stream.filesize))
            doc.update({"progress": 1 - (bytes_remaining / stream.filesize)})

        def on_complete(strm, file_path):
            # Do something with the downloaded video
            print("Download completed", file_path)
            doc.update({"progressMessage": "Processing", "progress": 0})
            process(file_path, request.uid, doc)

        yt.register_on_complete_callback(on_complete)
        yt.register_on_progress_callback(on_progress)

        threading.Thread(target=side_process).start()
        return {"vid": vid, "success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/video/{filename}")
async def stream_video(request: Request, filename: str):
    video_path = os.path.join(FILE_DIR, filename + ".mp4")
    return range_requests_response(
        request, file_path=video_path, content_type="video/mp4"
    )
