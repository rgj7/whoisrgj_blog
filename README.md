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

## Docker (Full Stack)

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### 1. Configure environment

```bash
cp .env.example .env
```

Open `.env` and set `SECRET_KEY` to a random value:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

`DATABASE_URL` is already configured inside `docker-compose.yml` — no changes needed.

### 2. Build and start

```bash
docker compose up --build
```

- Frontend: http://localhost
- API docs: http://localhost:8000/docs

### 3. Create admin user

```bash
docker compose exec backend python scripts/create_admin.py
```

### 4. Teardown

```bash
docker compose down        # stop and remove containers
docker compose down -v     # also delete the database volume
```

## API Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/posts` | No | List published posts (paginated, `?tag=slug`) |
| GET | `/api/posts/{slug}` | No | Single published post |
| GET | `/api/tags` | No | All tags |
| GET | `/api/pages` | No | List published pages |
| GET | `/api/pages/{slug}` | No | Single published page |
| GET | `/api/nav-links` | No | Ordered nav links (published pages only) |
| POST | `/api/auth/login` | No | Get JWT token |
| GET | `/api/admin/posts` | Yes | All posts (incl. drafts) |
| POST | `/api/admin/posts` | Yes | Create post |
| PUT | `/api/admin/posts/{id}` | Yes | Update post |
| DELETE | `/api/admin/posts/{id}` | Yes | Delete post |
| POST | `/api/admin/tags` | Yes | Create tag |
| DELETE | `/api/admin/tags/{id}` | Yes | Delete tag |
| GET | `/api/admin/pages` | Yes | All pages (incl. drafts) |
| POST | `/api/admin/pages` | Yes | Create page |
| PUT | `/api/admin/pages/{id}` | Yes | Update page |
| DELETE | `/api/admin/pages/{id}` | Yes | Delete page |
| GET | `/api/admin/nav-links` | Yes | All nav links ordered by position |
| POST | `/api/admin/nav-links` | Yes | Add a published page to the nav |
| DELETE | `/api/admin/nav-links/{id}` | Yes | Remove a nav link |
| PUT | `/api/admin/nav-links/reorder` | Yes | Reorder nav links (`{ ordered_ids: [...] }`) |

## Frontend Routes

| Path | Page |
|------|------|
| `/` | Post list |
| `/posts/:slug` | Single post |
| `/tags/:slug` | Posts by tag |
| `/pages/:slug` | Single page |
| `/login` | Admin login |
| `/admin` | Admin dashboard — Posts, Pages, Settings tabs (protected) |
| `/admin/posts/new` | Create post (protected) |
| `/admin/posts/:id/edit` | Edit post (protected) |
| `/admin/pages/new` | Create page (protected) |
| `/admin/pages/:id/edit` | Edit page (protected) |
