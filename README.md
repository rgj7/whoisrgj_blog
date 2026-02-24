# whoisrgj blog

A personal blog built with FastAPI + React. Posts are written in Markdown.

## Stack

- **Backend**: FastAPI, SQLAlchemy (async), asyncpg, Alembic, Neon (PostgreSQL), JWT auth
- **Frontend**: React 18 + Vite, Tailwind CSS, react-markdown, @uiw/react-md-editor, react-simple-maps
- **Reverse proxy**: Caddy (automatic HTTPS via Let's Encrypt)
- **Database**: [Neon](https://neon.tech) — serverless Postgres

## Local Development

### Prerequisites

- Python 3.14+
- Node.js 18+

### 1. Backend

```bash
cd backend
uv sync                       # creates .venv and installs from uv.lock
source .venv/bin/activate

cp .env.example .env
# Edit .env — set DATABASE_URL (Neon connection string) and SECRET_KEY

alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`.

### 2. Create admin user

```bash
cd backend
source .venv/bin/activate
python scripts/create_admin.py
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

## Code Quality

Pre-commit hooks run automatically on each commit. To install and run manually:

```bash
pip install pre-commit
pre-commit install
pre-commit run --all-files
```

| Tool | Scope | What it does |
|------|-------|--------------|
| ruff | backend | Lint + format Python |
| mypy | backend | Static type checking (`disallow_untyped_defs`) |
| prettier | frontend | Format JS/JSX/CSS |
| eslint | frontend | React + hooks rules |
| check-json / check-yaml / check-toml | all | Validate config files |
| detect-private-key | all | Prevent accidental secret commits |

## Docker (Full Stack)

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### 1. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon connection string (`postgresql+asyncpg://...`) |
| `SECRET_KEY` | Random secret — generate with `python -c "import secrets; print(secrets.token_hex(32))"` |
| `RAWG_API_KEY` | Optional — enables game info on posts |

### 2. Build and start

```bash
docker compose up --build
```

### 3. Create admin user

```bash
docker compose exec backend python scripts/create_admin.py
```

### 4. Teardown

```bash
docker compose down        # stop and remove containers
docker compose down -v     # also delete volumes
```
