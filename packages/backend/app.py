import pathlib
import threading

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pytube import YouTube

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}


class DownloadRequest(BaseModel):
    url: str
    # uid: str
    vid: str


@app.post("/download")
async def download_video(request: DownloadRequest):
    try:
        yt = YouTube(request.url)

        stream = yt.streams.get_highest_resolution()

        print("Downloading video", stream.filesize, stream.title, stream.url)

        def side_process():
            output_path = pathlib.Path(__file__).parent.parent.parent.absolute().joinpath("videos")
            filename = f"{request.vid}"
            stream.download(
                output_path=str(output_path),
                filename=filename
            )

        def on_progress(strm, chunk, bytes_remaining):
            # Do something with the progress
            print("Download progress", 1 - (bytes_remaining / stream.filesize))

        def on_complete(strm, file_path):
            # Do something with the downloaded video
            print("Download completed", file_path)

        yt.register_on_complete_callback(on_complete)
        yt.register_on_progress_callback(on_progress)

        threading.Thread(target=side_process).start()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
