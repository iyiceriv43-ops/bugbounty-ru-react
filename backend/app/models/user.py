from datetime import datetime
from sqlalchemy import String, Text, Integer, ForeignKey, DateTime, Boolean, UniqueConstraint, BigInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    auth_key: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), default="")
    email: Mapped[str] = mapped_column(String(200), unique=True, index=True, nullable=False)
    telegram: Mapped[str] = mapped_column(String(50), default="")
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending | approved | banned
    role: Mapped[str] = mapped_column(String(20), default="user")  # admin | user
    reward: Mapped[int] = mapped_column(Integer, default=0)
    bonus_points: Mapped[int] = mapped_column(Integer, default=0)
    password: Mapped[str | None] = mapped_column(String(255), nullable=True)  # raw password for migration only
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    profile: Mapped["ProfileSettings"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    reports: Mapped[list["app.models.report.Report"]] = relationship(back_populates="reporter_relation")
    articles: Mapped[list["app.models.article.Article"]] = relationship(back_populates="author_relation")
    notifications: Mapped[list["Notification"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class ProfileSettings(Base):
    __tablename__ = "profile_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    auth_key: Mapped[str] = mapped_column(String(20), ForeignKey("users.auth_key", ondelete="CASCADE"), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(200), default="")
    email: Mapped[str] = mapped_column(String(200), default="")
    telegram: Mapped[str] = mapped_column(String(50), default="")
    bio: Mapped[str] = mapped_column(Text, default="")
    avatar: Mapped[str] = mapped_column(Text, default="")  # data URL or file path
    banner: Mapped[str] = mapped_column(Text, default="")  # data URL or file path
    member_since: Mapped[str] = mapped_column(String(100), default="")

    user: Mapped["User"] = relationship(back_populates="profile")


class Follow(Base):
    __tablename__ = "follows"
    __table_args__ = (UniqueConstraint("follower_key", "target_key", name="uq_follow"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    follower_key: Mapped[str] = mapped_column(String(20), ForeignKey("users.auth_key", ondelete="CASCADE"), index=True)
    target_key: Mapped[str] = mapped_column(String(20), ForeignKey("users.auth_key", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    follower: Mapped["User"] = relationship("User", foreign_keys=[follower_key])
    target: Mapped["User"] = relationship("User", foreign_keys=[target_key])


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    auth_key: Mapped[str] = mapped_column(String(20), ForeignKey("users.auth_key", ondelete="CASCADE"), index=True, nullable=False)
    ts: Mapped[int] = mapped_column(BigInteger, nullable=False)  # epoch ms
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    type: Mapped[str] = mapped_column(String(50), default="")
    actor_key: Mapped[str] = mapped_column(String(50), default="")
    actor_name: Mapped[str] = mapped_column(String(200), default="")
    text: Mapped[str] = mapped_column(Text, default="")
    # optional fields for various types
    report_id: Mapped[str | None] = mapped_column(String(20), nullable=True)
    report_title: Mapped[str | None] = mapped_column(String(500), nullable=True)
    article_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    article_title: Mapped[str | None] = mapped_column(String(500), nullable=True)
    reward: Mapped[int | None] = mapped_column(Integer, nullable=True)
    xp: Mapped[int | None] = mapped_column(Integer, nullable=True)
    data_json: Mapped[str] = mapped_column(Text, default="{}")  # extra JSON for forwards-compat

    user: Mapped["User"] = relationship(back_populates="notifications")