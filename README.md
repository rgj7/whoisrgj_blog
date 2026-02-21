# whoisrgj.com — Personal Blog

A personal blog built with FastAPI + React. Posts are written in Markdown.

## Stack

- **Backend**: FastAPI, SQLAlchemy (async), asyncpg, Alembic, PostgreSQL, JWT auth
- **Frontend**: React 18 + Vite, Tailwind CSS, react-markdown, @uiw/react-md-editor, react-simple-maps

## Local Development

### Prerequisites

- Python 3.14+
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
uv sync                       # creates .venv and installs from uv.lock
source .venv/bin/activate

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

