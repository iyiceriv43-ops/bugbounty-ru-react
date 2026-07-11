from datetime import datetime
from sqlalchemy import String, Text, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String(20), primary_key=True)  # R-XXXX-XX
    report_id: Mapped[str] = mapped_column(String(20), default="")  # duplicate of id (legacy)
    target: Mapped[str] = mapped_column(String(200), default="")  # display name
    slug: Mapped[str] = mapped_column(String(100), ForeignKey("programs.slug", ondelete="SET NULL"), index=True, nullable=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), default="Low")
    cvss: Mapped[str] = mapped_column(String(200), default="")
    desc: Mapped[str] = mapped_column(Text, default="")
    steps: Mapped[list] = mapped_column(JSONB, default=list)  # string[]
    files_count: Mapped[int] = mapped_column(Integer, default=0)
    reporter: Mapped[str] = mapped_column(String(200), default="")
    reporter_name: Mapped[str] = mapped_column(String(200), default="")
    reporter_key: Mapped[str | None] = mapped_column(String(20), ForeignKey("users.auth_key", ondelete="SET NULL"), index=True, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="triage")  # triage | confirmed | rejected | needs_revision
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    reward: Mapped[int] = mapped_column(Integer, default=0)  # rubles
    xp: Mapped[int] = mapped_column(Integer, default=0)  # XP points

    program: Mapped["app.models.program.Program | None"] = relationship(back_populates="reports")
    reporter_relation: Mapped["app.models.user.User | None"] = relationship(
        "User", foreign_keys=[reporter_key], back_populates="reports"
    )
    chat_messages: Mapped[list["ChatMessage"]] = relationship(
        back_populates="report", cascade="all, delete-orphan", order_by="ChatMessage.ts"
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    report_id: Mapped[str] = mapped_column(String(20), ForeignKey("reports.id", ondelete="CASCADE"), index=True, nullable=False)
    from_field: Mapped[str] = mapped_column(String(20), default="me")  # admin | me
    text: Mapped[str] = mapped_column(Text, default="")
    ts: Mapped[int] = mapped_column(Integer, nullable=False)  # epoch ms
    sender_key: Mapped[str | None] = mapped_column(String(20), nullable=True)
    sender_role: Mapped[str] = mapped_column(String(20), default="")

    report: Mapped["Report"] = relationship(back_populates="chat_messages")