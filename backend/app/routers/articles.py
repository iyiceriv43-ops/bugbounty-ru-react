import time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth_deps import get_current_user
from app.models.article import Article, ArticleComment, ArticleLike
from app.models.user import User
from app.schemas.article import ArticleCreate, ArticleUpdate, ArticleOut, CommentCreate, CommentOut

router = APIRouter(prefix="/api/articles", tags=["articles"])


def _article_to_out(article: Article) -> dict:
    return {
        "id": article.id,
        "title": article.title,
        "body": article.body,
        "category": article.category or "",
        "author": article.author or "",
        "author_key": article.author_key,
        "created_at": article.created_at,
        "views": article.views,
        "likes": [like.user_key for like in article.likes],
        "comments": [
            CommentOut(
                id=c.id,
                author=c.author or "",
                author_key=c.author_key,
                text=c.text,
                created_at=c.created_at,
            ).model_dump()
            for c in article.comments
        ],
    }


@router.get("/", response_model=list[ArticleOut])
async def list_articles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Article).options(selectinload(Article.likes), selectinload(Article.comments))
        .order_by(Article.created_at.desc())
    )
    articles = result.scalars().unique().all()
    return [_article_to_out(a) for a in articles]


@router.get("/{article_id}", response_model=ArticleOut)
async def get_article(article_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Article).options(selectinload(Article.likes), selectinload(Article.comments))
        .where(Article.id == article_id)
    )
    article = result.scalar_one_or_none()
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    return _article_to_out(article)


@router.post("/", response_model=ArticleOut)
async def create_article(
    payload: ArticleCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    article = Article(
        id=f"art-{int(time.time())}",
        title=payload.title,
        body=payload.body,
        category=payload.category or None,
        author=user.name,
        author_key=user.auth_key,
    )
    db.add(article)
    await db.commit()
    await db.refresh(article)
    # eager-load likes/comments for the response
    result = await db.execute(
        select(Article).options(selectinload(Article.likes), selectinload(Article.comments))
        .where(Article.id == article.id)
    )
    article = result.scalar_one()
    return _article_to_out(article)


@router.put("/{article_id}", response_model=ArticleOut)
async def update_article(
    article_id: str,
    payload: ArticleUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Article).options(selectinload(Article.likes), selectinload(Article.comments))
        .where(Article.id == article_id)
    )
    article = result.scalar_one_or_none()
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    is_admin = user.role == "admin"
    is_owner = article.author_key == user.auth_key
    if not is_admin and not is_owner:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    for field, value in payload.model_dump(exclude_unset=True).items():
        if field == "category" and not value:
            value = None
        setattr(article, field, value)
    await db.commit()
    await db.refresh(article)
    return _article_to_out(article)


@router.delete("/{article_id}")
async def delete_article(
    article_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Article).options(selectinload(Article.likes), selectinload(Article.comments))
        .where(Article.id == article_id)
    )
    article = result.scalar_one_or_none()
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    is_admin = user.role == "admin"
    is_owner = article.author_key == user.auth_key
    if not is_admin and not is_owner:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    await db.delete(article)
    await db.commit()
    return {"ok": True}


@router.post("/{article_id}/like")
async def toggle_like(
    article_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Article).where(Article.id == article_id))
    article = result.scalar_one_or_none()
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    result = await db.execute(
        select(ArticleLike).where(
            ArticleLike.article_id == article_id,
            ArticleLike.user_key == user.auth_key,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        await db.delete(existing)
        liked = False
    else:
        db.add(ArticleLike(article_id=article_id, user_key=user.auth_key))
        liked = True
    await db.commit()
    return {"liked": liked}


@router.post("/{article_id}/comments", response_model=CommentOut)
async def add_comment(
    article_id: str,
    payload: CommentCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Article).where(Article.id == article_id))
    article = result.scalar_one_or_none()
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    comment = ArticleComment(
        id=f"c-{int(time.time())}",
        article_id=article_id,
        author=user.name,
        author_key=user.auth_key,
        text=payload.text,
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return comment


@router.post("/{article_id}/views")
async def increment_views(article_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Article).where(Article.id == article_id))
    article = result.scalar_one_or_none()
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    article.views += 1
    await db.commit()
    return {"views": article.views}