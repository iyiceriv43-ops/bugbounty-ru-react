from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import create_all
from app.routers import auth, programs, reports, articles, categories, business, users, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_all()
    yield


app = FastAPI(
    title="BugBounty RU API",
    version="1.0.0",
    description="Backend API for HackPark bug bounty platform",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(programs.router)
app.include_router(reports.router)
app.include_router(articles.router)
app.include_router(categories.router)
app.include_router(business.router)
app.include_router(users.router)
app.include_router(admin.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "bugbounty-ru-api"}