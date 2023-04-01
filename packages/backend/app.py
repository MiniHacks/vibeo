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
from openai import *
import chromadb

from backend.stream import *
from backend.models import Word, Sentence, Section, Transcript, DownloadRequest
from backend.utils import (
    extract_wav_from_mp4,
    parse_srt_to_words,
    accumulate_words_to_sentences,
    accumulate_sentences_to_sections,
    transcript_from_srt,
)

db_client = chromadb.Client()
collection = db_client.create_collection("transcripts")

# take environment variables from ../../.env.
env_path = Path(__file__).parent.parent.parent.absolute().joinpath(".env")
FILE_DIR = Path(__file__).parent.parent.parent.absolute().joinpath("videos")
print("Loading environment variables from", env_path)
load_dotenv(dotenv_path=env_path)

openai.api_key = os.environ["OPENAI_KEY"]


def get_embeddings(input: List[str]) -> List[List[float]]:
    embed_response = openai.Embedding.create(
        input=input, model="text-embedding-ada-002"
    )
    return [x["embedding"] for x in embed_response.data]  # type: ignore


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
    cmd = f"whisperx {wav_name} --hf_token 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 --vad_filter --model tiny.en --output_dir {FILE_DIR} --output_type srt-word"
    subprocess.run(cmd, shell=True)

    srt_file = file_name.with_suffix(".wav.word.srt")
    transcript: Transcript = transcript_from_srt(srt_file)
    sections = transcript.sections
    sentences = list(chain.from_iterable([section.sentences for section in sections]))

    section_embeddings = get_embeddings([section.content for section in sections])
    sentence_embeddings = get_embeddings([sentence.content for sentence in sentences])
    sentence_metadatas = [
        {"uid": uid, "vid": vid, "type": "sentence"} for _ in range(len(sections))
    ]

    collection.add(
        embeddings=section_embeddings,
        documents=sentences,
        metadatas=sentence_metadatas,
        ids=["doc1", "doc2"],
    )

    return "lgtm"


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
