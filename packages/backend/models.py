from pydantic import BaseModel

class Word(BaseModel):
    start: float
    end: float
    content: str


class Sentence(BaseModel):
    start: float
    end: float
    content: str

class Section(BaseModel):
    start: float
    end: float
    content: str


class DownloadRequest(BaseModel):
    url: str
    uid: str
