from pydantic import BaseModel


class TagBase(BaseModel):
    name: str


class TagCreate(TagBase):
    pass


class TagOut(BaseModel):
    id: int
    name: str
    slug: str

    model_config = {"from_attributes": True}
