from sqlalchemy import Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class NavLink(Base):
    __tablename__ = "nav_links"
    __table_args__ = (UniqueConstraint("page_id", name="uq_nav_links_page_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    page_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("pages.id", ondelete="CASCADE"), nullable=False
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    page: Mapped["Page"] = relationship("Page", lazy="joined")
