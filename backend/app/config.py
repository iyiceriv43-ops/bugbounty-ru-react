from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://macbookpro@127.0.0.1:5432/bugbounty_ru"
    DATABASE_URL_SYNC: str = "postgresql://macbookpro@127.0.0.1:5432/bugbounty_ru"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,https://iyiceriv43-ops.github.io"
    HOST: str = "127.0.0.1"
    PORT: int = 8000

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()