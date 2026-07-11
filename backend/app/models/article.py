from datetime import datetime
from sqlalchemy import String, Text, Integer, ForeignKey, DateTime, Boolean, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Article(Base):
    __tablename__ = "articles"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)  # art-<ts>
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    body: Mapped[str] = mapped_column(Text, default="")  # HTML from Quill
    category: Mapped[str] = mapped_column(String(50), ForeignKey("subcategories.id", ondelete="SET NULL"), nullable=True, index=True)
    author: Mapped[str] = mapped_column(String(200), default="")
    author_key: Mapped[str | None] = mapped_column(String(20), ForeignKey("users.auth_key", ondelete="SET NULL"), nullable=True, index=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    views: Mapped[int] = mapped_column(Integer, default=0)

    author_relation: Mapped["app.models.user.User | None"] = relationship("User", back_populates="articles")
    subcategory: Mapped["app.models.category.Subcategory | None"] = relationship(back_populates="articles")
    comments: Mapped[list["ArticleComment"]] = relationship(
        back_populates="article", cascade="all, delete-orphan", order_by="ArticleComment.created_at"
    )
    likes: Mapped[list["ArticleLike"]] = relationship(
        back_populates="article", cascade="all, delete-orphan"
    )


class ArticleComment(Base):
    __tablename__ = "article_comments"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)  # c-<ts>
    article_id: Mapped[str] = mapped_column(String(50), ForeignKey("articles.id", ondelete="CASCADE"), index=True, nullable=False)
    author: Mapped[str] = mapped_column(String(200), default="")
    author_key: Mapped[str | None] = mapped_column(String(20), nullable=True)
    text: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    article: Mapped["Article"] = relationship(back_populates="comments")


class ArticleLike(Base):
    __tablename__ = "article_likes"
    __table_args__ = (UniqueConstraint("article_id", "user_key", name="uq_article_like"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    article_id: Mapped[str] = mapped_column(String(50), ForeignKey("articles.id", ondelete="CASCADE"), index=True, nullable=False)
    user_key: Mapped[str] = mapped_column(String(20), ForeignKey("users.auth_key", ondelete="CASCADE"), index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    article: Mapped["Article"] = relationship(back_populates="likes")