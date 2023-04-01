from pathlib import Path
import subprocess
from typing import List
import os
import threading
from itertools import chain


from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from firebase_admin import credentials, firestore, initialize_app
from pytube import YouTube
import openai
from chromadb import Client as chroma_client
from chromadb.config import Settings

from backend.stream import *
from backend.models import Word, Sentence, Section, Transcript, DownloadRequest
from backend.utils import (
    extract_wav_from_mp4,
    transcript_from_srt,
)


# take environment variables from ../../.env.
ENV_PATH = Path(__file__).parent.parent.parent.absolute().joinpath(".env")
FILE_DIR = Path(__file__).parent.parent.parent.absolute().joinpath("videos")
WHISPER__MODEL = "tiny.en"

print("Loading environment variables from", ENV_PATH)
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
    return embed_response.data.embedding  # type: ignore


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


@app.get("/process")
async def process(vid: str, uid: str):
    file_name = (FILE_DIR / vid).with_suffix(".mp4")
    wav_name = file_name.with_suffix(".wav")
    extract_wav_from_mp4(file_name, wav_name)
    cmd = f"whisperx {wav_name} --hf_token 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 --vad_filter --model {WHISPER__MODEL} --output_dir {FILE_DIR} --output_type srt-word"
    subprocess.run(cmd, shell=True)

    srt_file = file_name.with_suffix(".wav.word.srt")
    transcript: Transcript = transcript_from_srt(srt_file)

    sections = transcript.sections
    sentences = list(chain.from_iterable([section.sentences for section in sections]))

    sentence_embeddings = get_embeddings([sentence.content for sentence in sentences])
    sentence_documents = [x.content for x in sentences]
    sentence_metadatas: list[dict[str, str]] = [
        {"uid": uid, "vid": vid, "type": "sentence"} for _ in sentences
    ]
    sentence_ids = [f"{vid}_sentence_{i}" for i in range(len(sentences))]

    collection.add(
        embeddings=sentence_embeddings,
        documents=sentence_documents,
        metadatas=sentence_metadatas,  # type: ignore
        ids=sentence_ids,
    )

    section_embeddings = get_embeddings([section.content for section in sections])
    section_documents = [x.content for x in sections]
    section_metadatas: list[dict[str, str]] = [
        {"uid": uid, "vid": vid, "type": "section"} for _ in sections
    ]
    section_ids = [f"{vid}_section_{i}" for i in range(len(sections))]

    collection.add(
        embeddings=section_embeddings,
        documents=section_documents,
        metadatas=section_metadatas,  # type: ignore
        ids=section_ids,
    )

    return "lgtm"


@app.get("/search")
async def search(query: str, uid: str, vid: str | None = None):
    query_embedding = get_embedding(query)
    collection.query(
        query_embeddings=query_embedding, n_results=5, where={"source": "my_source"}
    )


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
