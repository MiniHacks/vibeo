from pydantic import BaseModel
from typing import List


class Word(BaseModel):
    start: float
    end: float
    content: str


class Sentence(BaseModel):
    start: float
    end: float
    words: List[Word]


class Section(BaseModel):
    start: float
    end: float
    sentences: List[Sentence]


class Transcript(BaseModel):
    sections: List[Section]


class DownloadRequest(BaseModel):
    url: str
    uid: str
