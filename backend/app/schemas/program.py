from datetime import datetime
from pydantic import BaseModel


class ProgramBase(BaseModel):
    slug: str
    company: str
    parent_company: str = ""
    logo: str = ""
    logo_img: str = ""
    description: str = ""
    languages: list[str] = []
    status: str = "active"
    launched_at: str = ""
    edited_at: str = ""
    response_time: str = ""
    reward_time: str = ""
    max_bounty: str = ""
    reports_accepted: int = 0
    scope_domains: list[str] = []
    scope_platforms: list[str] = []
    scope_docs: list[str] = []
    important: list[str] = []
    out_of_scope: list[str] = []
    rewards: list[dict] = []
    rules: list[str] = []
    cat: str = ""
    badge: str = ""
    badge_text: str = ""
    researchers: int = 0
    reports_count: int = 0


class ProgramOut(ProgramBase):
    model_config = {"from_attributes": True}


class ProgramCreate(ProgramBase):
    pass


class ProgramUpdate(BaseModel):
    company: str | None = None
    parent_company: str | None = None
    logo: str | None = None
    logo_img: str | None = None
    description: str | None = None
    languages: list[str] | None = None
    status: str | None = None
    response_time: str | None = None
    reward_time: str | None = None
    max_bounty: str | None = None
    reports_accepted: int | None = None
    scope_domains: list[str] | None = None
    scope_platforms: list[str] | None = None
    scope_docs: list[str] | None = None
    important: list[str] | None = None
    out_of_scope: list[str] | None = None
    rewards: list[dict] | None = None
    rules: list[str] | None = None
    edited_at: str | None = None