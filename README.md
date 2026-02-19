# whoisrgj.com — Personal Blog

A personal blog built with FastAPI + React. Posts are written in Markdown.

## Stack

- **Backend**: FastAPI, SQLAlchemy, Alembic, PostgreSQL, JWT auth
- **Frontend**: React 18 + Vite, Tailwind CSS, react-markdown, @uiw/react-md-editor

## Local Development

### Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL (or Docker)

### 1. Start PostgreSQL

```bash
docker run -d \
  --name blog-db \
  -e POSTGRES_USER=blog \
  -e POSTGRES_PASSWORD=blogpass \
  -e POSTGRES_DB=whoisrgj_blog \
  -p 5432:5432 \
  postgres:16
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env — set DATABASE_URL, SECRET_KEY

alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`.

### 3. Create admin user

```bash
cd backend
source .venv/bin/activate
python scripts/create_admin.py
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

## API Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/posts` | No | List published posts (paginated, `?tag=slug`) |
| GET | `/api/posts/{slug}` | No | Single published post |
| GET | `/api/tags` | No | All tags |
| POST | `/api/auth/login` | No | Get JWT token |
| GET | `/api/admin/posts` | Yes | All posts (incl. drafts) |
| POST | `/api/admin/posts` | Yes | Create post |
| PUT | `/api/admin/posts/{id}` | Yes | Update post |
| DELETE | `/api/admin/posts/{id}` | Yes | Delete post |
| POST | `/api/admin/tags` | Yes | Create tag |
| DELETE | `/api/admin/tags/{id}` | Yes | Delete tag |

## Frontend Routes

| Path | Page |
|------|------|
| `/` | Post list |
| `/posts/:slug` | Single post |
| `/tags/:slug` | Posts by tag |
| `/login` | Admin login |
| `/admin` | Admin dashboard (protected) |
| `/admin/posts/new` | Create post (protected) |
| `/admin/posts/:id/edit` | Edit post (protected) |
