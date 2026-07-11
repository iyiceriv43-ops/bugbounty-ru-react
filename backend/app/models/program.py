from datetime import datetime
from sqlalchemy import String, Text, Integer, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Program(Base):
    __tablename__ = "programs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    company: Mapped[str] = mapped_column(String(200), nullable=False)
    parent_company: Mapped[str] = mapped_column(String(200), default="")
    logo: Mapped[str] = mapped_column(String(10), default="")
    logo_img: Mapped[str] = mapped_column(Text, default="")
    description: Mapped[str] = mapped_column(Text, default="")
    languages: Mapped[list] = mapped_column(JSONB, default=list)  # ["Русский", "English"]
    status: Mapped[str] = mapped_column(String(20), default="active")  # active | closed | paused
    launched_at: Mapped[str] = mapped_column(String(20), default="")  # date string
    edited_at: Mapped[str] = mapped_column(String(20), default="")  # date string
    response_time: Mapped[str] = mapped_column(String(100), default="")
    reward_time: Mapped[str] = mapped_column(String(100), default="")
    max_bounty: Mapped[str] = mapped_column(String(100), default="")
    reports_accepted: Mapped[int] = mapped_column(Integer, default=0)
    scope_domains: Mapped[list] = mapped_column(JSONB, default=list)
    scope_platforms: Mapped[list] = mapped_column(JSONB, default=list)
    scope_docs: Mapped[list] = mapped_column(JSONB, default=list)
    important: Mapped[list] = mapped_column(JSONB, default=list)
    out_of_scope: Mapped[list] = mapped_column(JSONB, default=list)
    rewards: Mapped[list] = mapped_column(JSONB, default=list)  # [{vuln, bounty}]
    rules: Mapped[list] = mapped_column(JSONB, default=list)
    created_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    # Legacy/derived fields used by HomePage
    cat: Mapped[str] = mapped_column(String(50), default="")
    badge: Mapped[str] = mapped_column(String(50), default="")
    badge_text: Mapped[str] = mapped_column(String(100), default="")
    researchers: Mapped[int] = mapped_column(Integer, default=0)
    reports_count: Mapped[int] = mapped_column(Integer, default=0)

    reports: Mapped[list["app.models.report.Report"]] = relationship(back_populates="program")