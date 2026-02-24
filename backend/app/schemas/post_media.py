from typing import Literal

from pydantic import BaseModel

MediaType = Literal["game", "movie", "tv"]


class PostMediaIn(BaseModel):
    media_type: MediaType
    external_id: str
    title: str


class PostMediaOut(BaseModel):
    id: int
    media_type: str
    external_id: str
    title: str

    model_config = {"from_attributes": True}
