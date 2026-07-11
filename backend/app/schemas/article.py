from datetime import datetime
from pydantic import BaseModel


class ArticleBase(BaseModel):
    title: str
    body: str = ""
    category: str = ""
    author: str = ""


class ArticleCreate(ArticleBase):
    pass


class ArticleUpdate(BaseModel):
    title: str | None = None
    body: str | None = None
    category: str | None = None


class ArticleOut(ArticleBase):
    id: str
    author_key: str | None = None
    created_at: datetime | None = None
    views: int = 0
    likes: list[str] = []  # list of user auth_keys
    comments: list["CommentOut"] = []

    model_config = {"from_attributes": True}


class CommentCreate(BaseModel):
    text: str
    author: str = ""
    author_key: str | None = None


class CommentOut(BaseModel):
    id: str
    author: str
    author_key: str | None = None
    text: str
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


ArticleOut.model_rebuild()