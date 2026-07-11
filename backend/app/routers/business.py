import time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth_deps import get_admin_user
from app.models.business import BusinessRequest
from app.models.user import User
from app.schemas.misc import BusinessRequestCreate, BusinessRequestOut, BusinessRequestUpdate

router = APIRouter(prefix="/api/business", tags=["business"])


@router.get("/", response_model=list[BusinessRequestOut])
async def list_business_requests(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    result = await db.execute(select(BusinessRequest).order_by(BusinessRequest.submitted_at.desc()))
    return result.scalars().all()


@router.post("/", response_model=BusinessRequestOut)
async def create_business_request(
    payload: BusinessRequestCreate,
    db: AsyncSession = Depends(get_db),
):
    req = BusinessRequest(
        id=f"BR-{int(time.time())}",
        biz_company=payload.biz_company,
        biz_name=payload.biz_name,
        biz_phone=payload.biz_phone,
        biz_email=payload.biz_email,
        biz_size=payload.biz_size,
        biz_scope=payload.biz_scope,
        biz_comment=payload.biz_comment,
        biz_consent=payload.biz_consent,
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)
    return req


@router.put("/{req_id}", response_model=BusinessRequestOut)
async def update_business_request(
    req_id: str,
    payload: BusinessRequestUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    result = await db.execute(select(BusinessRequest).where(BusinessRequest.id == req_id))
    req = result.scalar_one_or_none()
    if req is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business request not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(req, field, value)
    await db.commit()
    await db.refresh(req)
    return req


@router.delete("/{req_id}")
async def delete_business_request(
    req_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    result = await db.execute(select(BusinessRequest).where(BusinessRequest.id == req_id))
    req = result.scalar_one_or_none()
    if req is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business request not found")
    await db.delete(req)
    await db.commit()
    return {"ok": True}