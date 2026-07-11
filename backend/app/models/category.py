from sqlalchemy import String, Text, ForeignKey, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    icon: Mapped[str] = mapped_column(String(50), default="")
    color: Mapped[str] = mapped_column(String(20), default="")
    desc: Mapped[str] = mapped_column(Text, default="")
    url: Mapped[str] = mapped_column(String(200), default="")
    page_desc: Mapped[str] = mapped_column(Text, default="")
    cover: Mapped[str] = mapped_column(String(50), default="")
    audience: Mapped[str] = mapped_column(String(20), default="all")
    tags: Mapped[str] = mapped_column(Text, default="[]")  # JSON array
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    subs: Mapped[list["Subcategory"]] = relationship(
        back_populates="parent", cascade="all, delete-orphan", order_by="Subcategory.sort_order"
    )


class Subcategory(Base):
    __tablename__ = "subcategories"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    parent_id: Mapped[str] = mapped_column(String(50), ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    parent_name: Mapped[str] = mapped_column(String(200), default="")
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    icon: Mapped[str] = mapped_column(String(50), default="")
    color: Mapped[str] = mapped_column(String(20), default="")
    desc: Mapped[str] = mapped_column(Text, default="")
    url: Mapped[str] = mapped_column(String(200), default="")
    page_desc: Mapped[str] = mapped_column(Text, default="")
    cover: Mapped[str] = mapped_column(String(50), default="")
    audience: Mapped[str] = mapped_column(String(20), default="all")
    tags: Mapped[str] = mapped_column(Text, default="[]")  # JSON array
    sub_topics: Mapped[str] = mapped_column(Text, default="[]")  # JSON array
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    parent: Mapped["Category"] = relationship(back_populates="subs")
    articles: Mapped[list["app.models.article.Article"]] = relationship(back_populates="subcategory")