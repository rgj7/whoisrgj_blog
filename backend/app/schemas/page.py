import re
from datetime import datetime

from pydantic import BaseModel, field_validator

SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def _validate_slug(v: str) -> str:
    if not SLUG_RE.match(v):
        raise ValueError(
            "Slug must be lowercase letters, numbers, and hyphens only, with no leading or trailing hyphens."
        )
    return v


class PageCreate(BaseModel):
    title: str
    slug: str
    content: str
    published: bool = False

    @field_validator("slug")
    @classmethod
    def slug_format(cls, v: str) -> str:
        return _validate_slug(v)


class PageUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    content: str | None = None
    published: bool | None = None

    @field_validator("slug")
    @classmethod
    def slug_format(cls, v: str | None) -> str | None:
        if v is None:
            return v
        return _validate_slug(v)


class PageOut(BaseModel):
    id: int
    title: str
    slug: str
    content: str
    published: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PageSummary(BaseModel):
    id: int
    title: str
    slug: str
    published: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
