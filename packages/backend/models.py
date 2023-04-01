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

    @property
    def content(self) -> str:
        return " ".join([word.content for word in self.words])


class Section(BaseModel):
    start: float
    end: float
    sentences: List[Sentence]

    @property
    def content(self) -> str:
        return " ".join([sentence.content for sentence in self.sentences])


class Transcript(BaseModel):
    sections: List[Section]


class DownloadRequest(BaseModel):
    url: str
    uid: str
