from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth_deps import get_admin_user
from app.models.user import User
from app.models.report import Report
from app.models.program import Program
from app.models.article import Article
from app.models.business import BusinessRequest

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
async def admin_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    users_count = await db.scalar(select(func.count()).select_from(User))
    reports_count = await db.scalar(select(func.count()).select_from(Report))
    programs_count = await db.scalar(select(func.count()).select_from(Program))
    articles_count = await db.scalar(select(func.count()).select_from(Article))
    pending_users = await db.scalar(select(func.count()).select_from(User).where(User.status == "pending"))
    confirmed_reports = await db.scalar(select(func.count()).select_from(Report).where(Report.status == "confirmed"))

    return {
        "users": users_count,
        "reports": reports_count,
        "programs": programs_count,
        "articles": articles_count,
        "pending_users": pending_users,
        "confirmed_reports": confirmed_reports,
    }