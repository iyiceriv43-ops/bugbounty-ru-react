from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth_deps import get_admin_user
from app.models.program import Program
from app.models.user import User
from app.schemas.program import ProgramOut, ProgramCreate, ProgramUpdate

router = APIRouter(prefix="/api/programs", tags=["programs"])


@router.get("/", response_model=list[ProgramOut])
async def list_programs(status: str | None = None, db: AsyncSession = Depends(get_db)):
    query = select(Program).order_by(Program.id)
    if status:
        query = query.where(Program.status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{slug}", response_model=ProgramOut)
async def get_program(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Program).where(Program.slug == slug))
    program = result.scalar_one_or_none()
    if program is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")
    return program


@router.post("/", response_model=ProgramOut)
async def create_program(
    payload: ProgramCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    result = await db.execute(select(Program).where(Program.slug == payload.slug))
    if result.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slug already exists")
    program = Program(**payload.model_dump())
    db.add(program)
    await db.commit()
    await db.refresh(program)
    return program


@router.put("/{slug}", response_model=ProgramOut)
async def update_program(
    slug: str,
    payload: ProgramUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    result = await db.execute(select(Program).where(Program.slug == slug))
    program = result.scalar_one_or_none()
    if program is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(program, field, value)
    await db.commit()
    await db.refresh(program)
    return program


@router.delete("/{slug}")
async def delete_program(
    slug: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    result = await db.execute(select(Program).where(Program.slug == slug))
    program = result.scalar_one_or_none()
    if program is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")
    await db.delete(program)
    await db.commit()
    return {"ok": True}