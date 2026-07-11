from datetime import datetime
from pydantic import BaseModel


class ReportBase(BaseModel):
    id: str
    target: str = ""
    slug: str | None = None
    title: str
    severity: str = "Low"
    cvss: str = ""
    desc: str = ""
    steps: list[str] = []
    files_count: int = 0
    reporter: str = ""
    reporter_name: str = ""
    status: str = "triage"
    reward: int = 0
    xp: int = 0


class ReportCreate(BaseModel):
    target: str = ""
    slug: str | None = None
    title: str
    severity: str = "Low"
    cvss: str = ""
    desc: str = ""
    steps: list[str] = []
    files_count: int = 0


class ReportUpdate(BaseModel):
    status: str | None = None
    reward: int | None = None
    xp: int | None = None
    title: str | None = None
    severity: str | None = None
    cvss: str | None = None
    desc: str | None = None
    steps: list[str] | None = None


class ReportOut(ReportBase):
    report_id: str = ""
    reporter_key: str | None = None
    submitted_at: datetime | None = None
    resolved_at: datetime | None = None

    model_config = {"from_attributes": True}


class ChatMessageOut(BaseModel):
    id: int
    report_id: str
    from_field: str
    text: str
    ts: int
    sender_key: str | None = None

    model_config = {"from_attributes": True}


class ChatMessageCreate(BaseModel):
    text: str
    from_field: str = "me"  # admin | me