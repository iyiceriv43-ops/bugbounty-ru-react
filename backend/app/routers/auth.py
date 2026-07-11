import random
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth_deps import get_current_user
from app.security import hash_password, verify_password, create_access_token
from app.models.user import User, ProfileSettings, Follow
from app.schemas.auth import (
    UserCreate,
    UserLogin,
    UserOut,
    Token,
    ProfileSettingsOut,
    ProfileSettingsUpdate,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def gen_auth_key() -> str:
    part1 = "".join(random.choice(ALPHABET) for _ in range(4))
    part2 = "".join(random.choice(ALPHABET) for _ in range(4))
    return f"HP-{part1}-{part2}"


def _token_for(user: User) -> Token:
    token = create_access_token({"sub": user.auth_key, "role": user.role})
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user))


@router.post("/register", response_model=Token)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    # check email unique
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # generate unique auth_key
    while True:
        key = gen_auth_key()
        result = await db.execute(select(User).where(User.auth_key == key))
        if result.scalar_one_or_none() is None:
            break

    user = User(
        auth_key=key,
        name=payload.name,
        phone=payload.phone,
        email=payload.email,
        telegram=payload.telegram,
        password_hash=hash_password(payload.password),
        status="pending",
        role="user",
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    # create default profile settings
    profile = ProfileSettings(
        auth_key=user.auth_key,
        display_name=user.name,
        email=user.email,
        telegram=user.telegram,
        member_since=datetime.now(timezone.utc).strftime("%B %Y"),
    )
    db.add(profile)
    await db.commit()
    await db.refresh(user)

    return _token_for(user)


@router.post("/login", response_model=Token)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    user.login_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(user)

    return _token_for(user)


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)):
    return user


@router.get("/profile/{auth_key}", response_model=ProfileSettingsOut)
async def get_profile(auth_key: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProfileSettings).where(ProfileSettings.auth_key == auth_key))
    profile = result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return profile


@router.put("/profile", response_model=ProfileSettingsOut)
async def update_profile(
    payload: ProfileSettingsUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ProfileSettings).where(ProfileSettings.auth_key == user.auth_key))
    profile = result.scalar_one_or_none()
    if profile is None:
        # create if missing
        profile = ProfileSettings(auth_key=user.auth_key, display_name=user.name, email=user.email)
        db.add(profile)
        await db.flush()

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    await db.commit()
    await db.refresh(profile)
    return profile


@router.post("/follow/{target_auth_key}")
async def toggle_follow(
    target_auth_key: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if target_auth_key == user.auth_key:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot follow yourself")

    result = await db.execute(select(User).where(User.auth_key == target_auth_key))
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    result = await db.execute(
        select(Follow).where(
            Follow.follower_key == user.auth_key,
            Follow.target_key == target_auth_key,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        await db.delete(existing)
        following = False
    else:
        db.add(Follow(follower_key=user.auth_key, target_key=target_auth_key))
        following = True
    await db.commit()
    return {"following": following}


@router.get("/followers/{auth_key}")
async def get_followers_count(auth_key: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(func.count()).select_from(Follow).where(Follow.target_key == auth_key))
    count = result.scalar_one()
    return {"auth_key": auth_key, "followers": count}