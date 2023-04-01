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
    sentences = List[Sentence]


class DownloadRequest(BaseModel):
    url: str
    uid: str
