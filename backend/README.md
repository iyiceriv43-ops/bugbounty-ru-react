# BugBounty RU — FastAPI Backend

## Requirements

- PostgreSQL 18 (or 14+)
- Python 3.11+

## Setup

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Configuration

Edit `.env`:

```
DATABASE_URL=postgresql+asyncpg://<user>@127.0.0.1:5432/bugbounty_ru
SECRET_KEY=<your-secret>
CORS_ORIGINS=http://localhost:5173
```

## Database

```bash
# Create database
createdb bugbounty_ru

# Tables are auto-created on first startup via SQLAlchemy create_all()
```

## Run

```bash
source .venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Current user info |
| GET | `/api/programs/` | List all programs |
| GET | `/api/programs/{slug}` | Get program |
| POST | `/api/programs/` | Create program (admin) |
| PUT | `/api/programs/{slug}` | Update program (admin) |
| DELETE | `/api/programs/{slug}` | Delete program (admin) |
| GET | `/api/reports/` | List reports (filters: slug, status, reporter_key) |
| GET | `/api/reports/{id}` | Get report |
| POST | `/api/reports/` | Create report |
| PUT | `/api/reports/{id}` | Update report (admin/owner) |
| GET | `/api/reports/{id}/chat` | List chat messages |
| POST | `/api/reports/{id}/chat` | Add chat message |
| GET | `/api/articles/` | List articles |
| GET | `/api/articles/{id}` | Get article |
| POST | `/api/articles/` | Create article |
| PUT | `/api/articles/{id}` | Update article (owner/admin) |
| DELETE | `/api/articles/{id}` | Delete article (owner/admin) |
| POST | `/api/articles/{id}/like` | Toggle like |
| POST | `/api/articles/{id}/comments` | Add comment |
| POST | `/api/articles/{id}/views` | Increment views |
| GET | `/api/categories/` | List categories with subcategories |
| GET | `/api/business/` | List business requests (admin) |
| POST | `/api/business/` | Create business request |
| GET | `/api/users/` | List users (admin) |
| GET | `/api/users/{key}` | Get user |
| PUT | `/api/users/{key}/status` | Update user status (admin) |
| GET | `/api/users/{key}/notifications` | Get notifications |
| GET | `/api/users/{key}/dash` | Get dash data |
| GET | `/api/admin/stats` | Admin statistics |
| GET | `/api/health` | Health check |

## Architecture

```
backend/
├── .env                  # Environment config
├── requirements.txt      # Python dependencies
└── app/
    ├── main.py           # FastAPI app + CORS + routers
    ├── config.py         # Pydantic settings
    ├── database.py       # SQLAlchemy async engine + Base
    ├── security.py       # Password hashing (argon2) + JWT
    ├── auth_deps.py      # get_current_user / get_admin_user
    ├── models/           # SQLAlchemy ORM models
    │   ├── user.py       # User, ProfileSettings, Follow, Notification
    │   ├── program.py    # Program
    │   ├── report.py     # Report, ChatMessage
    │   ├── article.py    # Article, ArticleComment, ArticleLike
    │   ├── category.py   # Category, Subcategory
    │   └── business.py   # BusinessRequest
    ├── schemas/          # Pydantic schemas
    └── routers/          # API route handlers
        ├── auth.py
        ├── programs.py
        ├── reports.py
        ├── articles.py
        ├── categories.py
        ├── business.py
        ├── users.py
        └── admin.py
```