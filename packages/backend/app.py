import tempfile
import threading
import time
from random import randint
from typing import Union, List

import ffmpeg
from dotenv import load_dotenv
from fastapi import FastAPI, Response
from fastapi.logger import logger
from firebase_admin import firestore
from pytube import YouTube
from sse_starlette.sse import EventSourceResponse
from starlette.responses import FileResponse
from pathlib import Path

from backend.connections import db
from backend.constants import ENV_PATH, FILE_DIR
from backend.models import (
    DownloadRequest,
    UploadRequest,
    StreamRequest,
    Selection,
    Context,
    Highlight,
)
from backend.stream import *
from backend.transcribe import tiny_transcribe, med_transcribe
from backend.utils import (
    process_video,
    get_transcript,
    query_vector_db,
    make_thumbnail,
    answer,
    stream_answer,
    get_sentence_and_section,
)

logger.setLevel("DEBUG")

logger.info(f"Loading environment variables from {ENV_PATH}")
load_dotenv(dotenv_path=ENV_PATH)

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}


def get_relevant_content(query: str, uid: str, vid: Union[str, None] = None):
    sentence_ids = (
        query_vector_db(query, where={"uid": uid, "type": "sentence"})
        if vid is None
        else query_vector_db(query, where={"uid": uid, "type": "sentence", "vid": vid})
    )

    relevant_content: List[Selection] = []
    for id in sentence_ids:
        vid, _, index = id.split("_")

        doc = get_transcript(vid)
        sentence, section = get_sentence_and_section(doc, int(index))
        # get index of sentence in section
        index = section.sentences.index(sentence)

        start_context_sentence_index = max(0, int(index) - 1)
        end_context_sentence_index = min(len(section.sentences), int(index) + 1)  # type: ignore
        context = " ".join(
            [
                s.content
                for s in section.sentences[
                    start_context_sentence_index:end_context_sentence_index
                ]
            ]
        )
        hightlight = Highlight(
            text=sentence.content, start=sentence.start, end=sentence.end
        )

        context = Context(
            text=context,
            start=section.sentences[start_context_sentence_index].start,
            end=section.sentences[end_context_sentence_index - 1].end,
        )  # type: ignore

        relevant_content.append(
            Selection(highlight=hightlight, context=context, vid=vid)
        )
    return relevant_content


@app.get("/search")
async def search(query: str, uid: str, vid: Union[str, None] = None):
    return (
        get_relevant_content(query, uid)
        if vid is None
        else get_relevant_content(query, uid, vid)
    )


@app.post("/stream_answer")
async def answer_stream(request: StreamRequest):
    context = request.context
    query = request.query

    return EventSourceResponse(stream_answer(query, context))


@app.get("/question")
async def question(query: str, uid: str, vid: Union[str, None] = None):
    context = (
        get_relevant_content(query, uid)
        if vid is None
        else get_relevant_content(query, uid, vid)
    )
    response = answer(query, context)
    return {"answer": response, "content": context}


from fastapi import File, UploadFile, Form, Request


@app.post("/upload")
async def upload_video(uid: str, file: UploadFile = File(...)):
    time, doc = db.collection("videos").add(
        {
            "name": "Uploaded Video",
            "type": "uploaded",
            "done": False,
            "progressMessage": "Downloading",
            "progress": 0,
            "uid": uid,
            "created": firestore.SERVER_TIMESTAMP,  # type: ignore
        }
    )

    vid = doc.id

    file_name = f"{vid}.mp4"
    file_path = os.path.join(FILE_DIR, file_name)
    with open(file_path, "wb") as f:
        f.write(await file.read())
        # f.write(request.file)

    # TODO: maybe file_name -> file_path?
    process_video(file_name, uid, doc)

    return {"fileName": file_name}


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
            [vid, time] = filename[:-4].split("_")
            make_thumbnail(vid, time)

        headers = {"Cache-Control": "public, max-age=31536000"}
        return FileResponse(os.path.join(FILE_DIR, filename), headers=headers)

    video_path = os.path.join(FILE_DIR, filename + ".mp4")
    try:
        return range_requests_response(
            request, file_path=video_path, content_type="video/mp4"
        )
    except Exception as e:
        return {"error": str(e)}


def getFilePath(id, partial):
    return f"{FILE_DIR}/{id}-{partial}.webm"


@app.get("/tiny")
async def tiny(uid: str, partial: int):
    # result = tiny.transcribe()
    start_time = time.time()
    path = getFilePath(uid, partial)
    result = tiny_transcribe(path)

    return {
        "time": time.time() - start_time,
        "path": getFilePath(uid, partial),
        "result": result,
    }


@app.get("/revise")
async def revise(uid: str, partial: int, num: int):
    if partial < 4:
        return {"result": "No revision needed"}
    start_time = time.time()
    # create a temp output file below using a python package
    file = tempfile.mktemp(suffix=".webm")
    # concatenate the last num partials using ffmpeg
    files = [
        ffmpeg.input(getFilePath(uid, i)) for i in range(partial - num + 1, partial + 1)
    ]
    ffmpeg.concat(*files, v=0, a=1).output(file).run()

    result = med_transcribe(file)
    return {"time": time.time() - start_time, "result": result, "file": file}
