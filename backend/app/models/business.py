from datetime import datetime
from sqlalchemy import String, Text, Integer, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class BusinessRequest(Base):
    __tablename__ = "business_requests"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)  # BR-<ts>
    biz_company: Mapped[str] = mapped_column(String(200), default="")
    biz_name: Mapped[str] = mapped_column(String(200), default="")
    biz_phone: Mapped[str] = mapped_column(String(30), default="")
    biz_email: Mapped[str] = mapped_column(String(200), default="")
    biz_size: Mapped[str] = mapped_column(String(50), default="")
    biz_scope: Mapped[str] = mapped_column(Text, default="")
    biz_comment: Mapped[str] = mapped_column(Text, default="")
    biz_consent: Mapped[bool] = mapped_column(Boolean, default=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    status: Mapped[str] = mapped_column(String(20), default="new")  # new | in_progress | done