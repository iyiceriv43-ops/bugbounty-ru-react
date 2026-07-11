from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    phone: str = ""
    email: EmailStr
    telegram: str = ""
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    auth_key: str
    name: str
    phone: str = ""
    email: str
    telegram: str = ""
    status: str = "pending"
    role: str = "user"
    reward: int = 0
    bonus_points: int = 0
    submitted_at: datetime | None = None
    approved_at: datetime | None = None
    login_at: datetime | None = None

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ProfileSettingsOut(BaseModel):
    display_name: str = ""
    email: str = ""
    telegram: str = ""
    bio: str = ""
    avatar: str = ""
    banner: str = ""
    member_since: str = ""

    model_config = {"from_attributes": True}


class ProfileSettingsUpdate(BaseModel):
    display_name: str | None = None
    email: str | None = None
    telegram: str | None = None
    bio: str | None = None
    avatar: str | None = None
    banner: str | None = None
    member_since: str | None = None