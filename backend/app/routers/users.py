from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth_deps import get_current_user, get_admin_user
from app.models.user import User, Notification
from app.models.report import Report
from app.schemas.auth import UserOut
from app.schemas.misc import NotificationOut, DashData

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/", response_model=list[UserOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    result = await db.execute(select(User).order_by(User.submitted_at.desc()))
    return result.scalars().all()


@router.get("/{auth_key}", response_model=UserOut)
async def get_user(auth_key: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.auth_key == auth_key))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.put("/{auth_key}/status", response_model=UserOut)
async def update_user_status(
    auth_key: str,
    new_status: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    result = await db.execute(select(User).where(User.auth_key == auth_key))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.status = new_status
    if new_status == "approved" and user.approved_at is None:
        user.approved_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/{auth_key}/notifications", response_model=list[NotificationOut])
async def get_notifications(
    auth_key: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    is_admin = user.role == "admin"
    if user.auth_key != auth_key and not is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    result = await db.execute(
        select(Notification).where(Notification.auth_key == auth_key).order_by(Notification.ts.desc())
    )
    return result.scalars().all()


@router.put("/{auth_key}/notifications/read")
async def mark_all_notifications_read(
    auth_key: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.auth_key != auth_key:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    result = await db.execute(select(Notification).where(Notification.auth_key == auth_key))
    for notif in result.scalars().all():
        notif.read = True
    await db.commit()
    return {"ok": True}


@router.put("/{auth_key}/notifications/{notif_id}/read", response_model=NotificationOut)
async def mark_notification_read(
    auth_key: str,
    notif_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.auth_key != auth_key:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    result = await db.execute(
        select(Notification).where(Notification.id == notif_id, Notification.auth_key == auth_key)
    )
    notif = result.scalar_one_or_none()
    if notif is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    notif.read = True
    await db.commit()
    await db.refresh(notif)
    return notif


def _rank_for_points(points: int) -> str:
    if points >= 8000:
        return "Legend"
    if points >= 3000:
        return "Elite"
    if points >= 1000:
        return "Expert"
    return "Skiller"


@router.get("/{auth_key}/dash", response_model=DashData)
async def get_user_dash(
    auth_key: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.auth_key == auth_key))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    result = await db.execute(
        select(
            func.count().label("count"),
            func.coalesce(func.sum(Report.reward), 0).label("earnings"),
            func.coalesce(func.sum(Report.xp), 0).label("xp_sum"),
        ).where(Report.reporter_key == auth_key, Report.status == "confirmed")
    )
    row = result.one()
    reports_count = row.count
    earnings = row.earnings
    xp_sum = row.xp_sum

    points = int(xp_sum) + user.bonus_points + 500
    rank = _rank_for_points(points)

    return DashData(
        reports=reports_count,
        earnings=int(earnings),
        points=points,
        rank=rank,
        bonus_earnings=0,
        bonus_points=user.bonus_points,
    )