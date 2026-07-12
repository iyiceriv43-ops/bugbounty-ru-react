from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


def _normalize_db_url(url: str) -> str:
    """Render/Heroku emit 'postgresql://...', but asyncpg needs 'postgresql+asyncpg://'."""
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


engine = create_async_engine(_normalize_db_url(settings.DATABASE_URL), echo=False, pool_size=10, max_overflow=20)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def create_all():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)