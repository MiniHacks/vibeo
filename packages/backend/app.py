import os
import pathlib
import threading

import firebase_admin
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from firebase_admin import credentials
from firebase_admin import firestore
from pydantic import BaseModel
from pytube import YouTube

from backend.stream import *

# take environment variables from ../../.env.
env_path = pathlib.Path(__file__).parent.parent.parent.absolute().joinpath(".env")
videos_path = pathlib.Path(__file__).parent.parent.parent.absolute().joinpath("videos")
print("Loading environment variables from", env_path)
load_dotenv(dotenv_path=env_path)

# Initialize Firebase Admin
cred = credentials.Certificate({
    "type": "service_account",
    "project_id": os.environ['FIREBASE_PROJECT_ID'],
    "private_key": os.environ['FIREBASE_AUTH_SECRET'].replace('\\n', '\n'),
    "client_email": os.environ['FIREBASE_CLIENT_EMAIL'],
    "token_uri": "https://oauth2.googleapis.com/token"
})

firebase_admin.initialize_app(cred)

db = firestore.client()

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}


class DownloadRequest(BaseModel):
    url: str
    uid: str


@app.post("/download")
async def download_video(request: DownloadRequest):
    try:
        yt = YouTube(request.url)

        stream = yt.streams.filter(
            file_extension="mp4",
        ).get_highest_resolution()

        time, doc = db.collection("videos").add({
            "name": stream.title,
            "type": "youtube",
            "youtube": request.url,
            "done": False,
            "progressMessage": "Downloading",
            "progress": 0,
            "uid": request.uid,
            "created": firestore.SERVER_TIMESTAMP
        })

        vid = doc.id

        print("Downloading video", doc.id, ":", stream.title)

        def side_process():
            filename = f"{vid}.mp4"
            stream.download(
                output_path=str(videos_path),
                filename=filename
            )

        def on_progress(strm, chunk, bytes_remaining):
            # Do something with the progress
            print("Download progress", 1 - (bytes_remaining / stream.filesize))
            doc.update({
                "progress": 1 - (bytes_remaining / stream.filesize)
            })

        def on_complete(strm, file_path):
            # Do something with the downloaded video
            print("Download completed", file_path)
            doc.update({
                "done": True,
                "progressMessage": "Processing",
            })

        yt.register_on_complete_callback(on_complete)
        yt.register_on_progress_callback(on_progress)

        threading.Thread(target=side_process).start()
        return {"vid": vid, "success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/video/{filename}")
async def stream_video(request: Request, filename: str):
    video_path = os.path.join(videos_path, filename + ".mp4")
    return range_requests_response(
        request, file_path=video_path, content_type="video/mp4"
    )
