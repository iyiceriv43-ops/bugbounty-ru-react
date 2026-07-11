import json
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.category import Category, Subcategory
from app.schemas.misc import CategoryOut, SubcategoryOut

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("/", response_model=list[CategoryOut])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).order_by(Category.sort_order))
    categories = result.scalars().unique().all()
    out = []
    for cat in categories:
        subs = []
        for sub in cat.subs:
            subs.append(SubcategoryOut(
                id=sub.id,
                parent_id=sub.parent_id,
                parent_name=sub.parent_name,
                name=sub.name,
                icon=sub.icon,
                color=sub.color,
                desc=sub.desc,
                url=sub.url,
                page_desc=sub.page_desc,
                cover=sub.cover,
                audience=sub.audience,
                tags=json.loads(sub.tags) if sub.tags else [],
                sub_topics=json.loads(sub.sub_topics) if sub.sub_topics else [],
            ))
        out.append(CategoryOut(
            id=cat.id,
            name=cat.name,
            icon=cat.icon,
            color=cat.color,
            desc=cat.desc,
            url=cat.url,
            page_desc=cat.page_desc,
            cover=cat.cover,
            audience=cat.audience,
            tags=json.loads(cat.tags) if cat.tags else [],
            subs=subs,
        ))
    return out