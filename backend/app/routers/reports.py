import random
import time
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth_deps import get_current_user
from app.models.report import Report, ChatMessage
from app.models.user import User, Notification
from app.schemas.report import ReportCreate, ReportUpdate, ReportOut, ChatMessageOut, ChatMessageCreate

router = APIRouter(prefix="/api/reports", tags=["reports"])

ID_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def gen_report_id() -> str:
    part1 = "".join(random.choice(ID_CHARS) for _ in range(4))
    part2 = "".join(random.choice(ID_CHARS) for _ in range(2))
    return f"R-{part1}-{part2}"


@router.get("/", response_model=list[ReportOut])
async def list_reports(
    slug: str | None = None,
    status: str | None = None,
    reporter_key: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Report).order_by(Report.submitted_at.desc())
    if slug:
        query = query.where(Report.slug == slug)
    if status:
        query = query.where(Report.status == status)
    if reporter_key:
        query = query.where(Report.reporter_key == reporter_key)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{report_id}", response_model=ReportOut)
async def get_report(report_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return report


@router.post("/", response_model=ReportOut)
async def create_report(
    payload: ReportCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    report_id = gen_report_id()
    report = Report(
        id=report_id,
        report_id=report_id,
        target=payload.target,
        slug=payload.slug,
        title=payload.title,
        severity=payload.severity,
        cvss=payload.cvss,
        desc=payload.desc,
        steps=payload.steps,
        files_count=payload.files_count,
        reporter=user.auth_key,
        reporter_name=user.name,
        reporter_key=user.auth_key,
        status="triage",
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


@router.put("/{report_id}", response_model=ReportOut)
async def update_report(
    report_id: str,
    payload: ReportUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    is_admin = user.role == "admin"
    is_owner = report.reporter_key == user.auth_key
    if not is_admin and not is_owner:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    old_status = report.status
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(report, field, value)

    # when status changes to confirmed, set resolved_at
    if payload.status is not None and payload.status != old_status:
        if payload.status == "confirmed":
            report.resolved_at = datetime.now(timezone.utc)
        elif payload.status in ("rejected", "needs_revision"):
            report.resolved_at = datetime.now(timezone.utc)

    # create notification for the reporter when confirmed or rejected (before commit)
    if payload.status is not None and payload.status != old_status and report.reporter_key:
        notif_type = (
            "report_confirmed" if payload.status == "confirmed"
            else "report_rejected" if payload.status == "rejected"
            else None
        )
        if notif_type:
            notif = Notification(
                id=f"n-{int(time.time())}-{''.join(random.choice('abcdefghijklmnopqrstuvwxyz0123456789') for _ in range(5))}",
                auth_key=report.reporter_key,
                ts=int(time.time() * 1000),
                read=False,
                type=notif_type,
                actor_key=user.auth_key,
                actor_name=user.name,
                text=f"Статус отчета изменён: {payload.status}",
                report_id=report.id,
                report_title=report.title,
                reward=report.reward if notif_type == "report_confirmed" else 0,
                xp=report.xp if notif_type == "report_confirmed" else 0,
            )
            db.add(notif)

    await db.commit()
    await db.refresh(report)

    return report


@router.get("/{report_id}/chat", response_model=list[ChatMessageOut])
async def list_chat(report_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ChatMessage).where(ChatMessage.report_id == report_id).order_by(ChatMessage.ts)
    )
    return result.scalars().all()


@router.post("/{report_id}/chat", response_model=ChatMessageOut)
async def add_chat(
    report_id: str,
    payload: ChatMessageCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    from_field = payload.from_field
    if user.role != "admin":
        from_field = "me"

    msg = ChatMessage(
        report_id=report_id,
        from_field=from_field,
        text=payload.text,
        ts=int(time.time() * 1000),
        sender_key=user.auth_key,
        sender_role=user.role,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg