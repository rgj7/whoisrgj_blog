from pydantic import BaseModel


class SiteProfileOut(BaseModel):
    photo_url: str | None = None
    bio: str | None = None

    model_config = {"from_attributes": True}


class SiteProfileUpdate(BaseModel):
    photo_url: str | None = None
    bio: str | None = None
