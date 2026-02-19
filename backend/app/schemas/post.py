from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.tag import TagOut


class PostBase(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    published: bool = False
    tag_ids: list[int] = []


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    published: Optional[bool] = None
    tag_ids: Optional[list[int]] = None


class PostOut(BaseModel):
    id: int
    title: str
    slug: str
    content: str
    excerpt: Optional[str]
    published: bool
    created_at: datetime
    updated_at: datetime
    tags: list[TagOut] = []

    model_config = {"from_attributes": True}


class PostSummary(BaseModel):
    id: int
    title: str
    slug: str
    excerpt: Optional[str]
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
