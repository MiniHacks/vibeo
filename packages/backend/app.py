import threading
from typing import Union

from dotenv import load_dotenv
from fastapi import FastAPI, Response
from fastapi.logger import logger
from firebase_admin import firestore
from pytube import YouTube
from starlette.responses import FileResponse

from backend.connections import db
from backend.constants import ENV_PATH, FILE_DIR
from backend.models import DownloadRequest
from backend.stream import *
from backend.utils import process_video, get_file, query_vector_db, make_thumbnail

logger.setLevel("DEBUG")

logger.info(f"Loading environment variables from {ENV_PATH}")
load_dotenv(dotenv_path=ENV_PATH)

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/search")
async def search(query: str, uid: str, vid: Union[str, None] = None):
    sentence_ids = query_vector_db(query, where={"uid": uid, "type": "sentence"})
    section_ids = query_vector_db(query, where={"uid": uid, "type": "section"})

    relevant_sentences = []
    for id in sentence_ids:
        vid, _, index = id.split("_")

        doc = get_file(vid)
        sentence = doc["sentences"][int(index)]
        relevant_sentences.append({"id": vid, "sentence": sentence})

    relevant_sections = []
    for id in section_ids:
        vid, _, index = id.split("_")

        doc = get_file(vid)
        section = doc["sections"][int(index)]
        relevant_sections.append({"id": vid, "section": section})

    return {
        "sentences": relevant_sentences,
        "sections": relevant_sections,
    }


@app.post("/download")
async def download_video(request: DownloadRequest, response: Response):
    print(request.url, request.uid)
    response.body = {"message": "Download started"}  # type: ignore
    try:
        yt = YouTube(request.url)

        stream = yt.streams.filter(
            file_extension="mp4",
        ).get_highest_resolution()
        if stream is None:
            print("no stream :(")
            raise Exception("No stream found")

        time, doc = db.collection("videos").add(
            {
                "name": stream.title,
                "type": "youtube",
                "youtube": request.url,
                "done": False,
                "progressMessage": "Downloading",
                "progress": 0,
                "uid": request.uid,
                "created": firestore.SERVER_TIMESTAMP,  # type: ignore
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
            process_video(file_path, request.uid, doc)

        yt.register_on_complete_callback(on_complete)
        yt.register_on_progress_callback(on_progress)

        threading.Thread(target=side_process).start()
        # return {"vid": vid, "success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/video/{filename}")
async def stream_video(request: Request, filename: str):
    if ".png" in filename:
        if filename not in os.listdir(FILE_DIR):
            [vid, time] = filename.split(".")[0].split("_")
            make_thumbnail(vid, time)

        return FileResponse(os.path.join(FILE_DIR, filename))

    video_path = os.path.join(FILE_DIR, filename + ".mp4")
    try:
        return range_requests_response(
            request, file_path=video_path, content_type="video/mp4"
        )
    except Exception as e:
        return {"error": str(e)}
