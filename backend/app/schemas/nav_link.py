from pydantic import BaseModel, model_validator

from app.schemas.page import PageSummary


class NavLinkOut(BaseModel):
    id: int
    page_id: int | None
    position: int
    page: PageSummary | None
    custom_label: str | None
    custom_url: str | None

    model_config = {"from_attributes": True}


class NavLinkAdd(BaseModel):
    page_id: int | None = None
    custom_label: str | None = None
    custom_url: str | None = None

    @model_validator(mode="after")
    def check_link_type(self) -> NavLinkAdd:
        has_page = self.page_id is not None
        has_custom = self.custom_label is not None and self.custom_url is not None
        if not has_page and not has_custom:
            raise ValueError("Provide either page_id or both custom_label and custom_url")
        if has_page and has_custom:
            raise ValueError("Provide either page_id or custom_label/custom_url, not both")
        return self


class NavLinkReorder(BaseModel):
    ordered_ids: list[int]
