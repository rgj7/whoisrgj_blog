from datetime import datetime

from pydantic import BaseModel

from app.schemas.post_media import PostMediaIn, PostMediaOut
from app.schemas.tag import TagOut


class PostBase(BaseModel):
    title: str
    content: str
    excerpt: str | None = None
    published: bool = False
    tag_ids: list[int] = []
    media: list[PostMediaIn] = []


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    excerpt: str | None = None
    published: bool | None = None
    tag_ids: list[int] | None = None
    media: list[PostMediaIn] | None = None


class PostOut(BaseModel):
    id: int
    title: str
    slug: str
    content: str
    excerpt: str | None
    published: bool
    created_at: datetime
    updated_at: datetime
    tags: list[TagOut] = []
    media: list[PostMediaOut] = []

    model_config = {"from_attributes": True}


class PostSummary(BaseModel):
    id: int
    title: str
    slug: str
    excerpt: str | None
    published: bool
    created_at: datetime
    updated_at: datetime
    tags: list[TagOut] = []

    model_config = {"from_attributes": True}


class PaginatedPosts(BaseModel):
    items: list[PostSummary]
    total: int
    page: int
    size: int
    pages: int
