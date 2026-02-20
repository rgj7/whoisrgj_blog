from sqlalchemy import Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from app.database import Base


class NavLink(Base):
    __tablename__ = "nav_links"
    __table_args__ = (UniqueConstraint("page_id", name="uq_nav_links_page_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    page_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("pages.id", ondelete="CASCADE"), nullable=True
    )
    custom_label: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    custom_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    page: Mapped[Optional["Page"]] = relationship("Page", lazy="joined")
