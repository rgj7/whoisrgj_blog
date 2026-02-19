from pydantic import BaseModel


class SocialLinkOut(BaseModel):
    id: int
    platform: str
    url: str
    position: int

    model_config = {"from_attributes": True}


class SocialLinkCreate(BaseModel):
    platform: str
    url: str


class SocialLinkReorder(BaseModel):
    ordered_ids: list[int]
