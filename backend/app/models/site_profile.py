from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SiteProfile(Base):
    __tablename__ = "site_profile"

    id: Mapped[int] = mapped_column(primary_key=True)
    photo_url: Mapped[str | None]
    bio: Mapped[str | None]
