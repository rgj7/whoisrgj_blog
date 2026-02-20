from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class WantedCountry(Base):
    __tablename__ = "wanted_countries"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    iso_numeric: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
