from datetime import datetime
from pydantic import BaseModel


class BusinessRequestCreate(BaseModel):
    biz_company: str = ""
    biz_name: str = ""
    biz_phone: str = ""
    biz_email: str = ""
    biz_size: str = ""
    biz_scope: str = ""
    biz_comment: str = ""
    biz_consent: bool = False


class BusinessRequestOut(BusinessRequestCreate):
    id: str
    submitted_at: datetime | None = None
    status: str = "new"

    model_config = {"from_attributes": True}


class BusinessRequestUpdate(BaseModel):
    status: str | None = None


class NotificationCreate(BaseModel):
    type: str = ""
    actor_key: str = ""
    actor_name: str = ""
    text: str = ""
    report_id: str | None = None
    report_title: str | None = None
    article_id: str | None = None
    article_title: str | None = None
    reward: int | None = None
    xp: int | None = None


class NotificationOut(BaseModel):
    id: str
    auth_key: str
    ts: int
    read: bool
    type: str
    actor_key: str
    actor_name: str
    text: str
    report_id: str | None = None
    report_title: str | None = None
    article_id: str | None = None
    article_title: str | None = None
    reward: int | None = None
    xp: int | None = None

    model_config = {"from_attributes": True}


class DashData(BaseModel):
    reports: int = 0
    earnings: int = 0
    points: int = 500
    rank: str = "Skiller"
    bonus_earnings: int = 0
    bonus_points: int = 0


class CategoryOut(BaseModel):
    id: str
    name: str
    icon: str = ""
    color: str = ""
    desc: str = ""
    url: str = ""
    page_desc: str = ""
    cover: str = ""
    audience: str = "all"
    tags: list[str] = []
    subs: list["SubcategoryOut"] = []

    model_config = {"from_attributes": True}


class SubcategoryOut(BaseModel):
    id: str
    parent_id: str = ""
    parent_name: str = ""
    name: str
    icon: str = ""
    color: str = ""
    desc: str = ""
    url: str = ""
    page_desc: str = ""
    cover: str = ""
    audience: str = "all"
    tags: list[str] = []
    sub_topics: list[str] = []