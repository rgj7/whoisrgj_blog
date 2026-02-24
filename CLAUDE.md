# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Backend**: FastAPI + SQLAlchemy (async) + asyncpg + Neon (PostgreSQL) (Python 3.14+)
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Auth**: JWT tokens (stored in localStorage), bcrypt for password hashing
- **Migrations**: Alembic
- **Deployment**: Docker Compose + Caddy (reverse proxy / automatic HTTPS)
- **CI/CD**: GitHub Actions (SSH deploy on push to `main`)

## Development Commands

### Backend
```bash
cd backend
uv sync                      # creates .venv and installs from uv.lock
source .venv/bin/activate    # or prefix commands with: uv run
cp .env.example .env  # set DATABASE_URL and SECRET_KEY
alembic upgrade head  # run migrations
uvicorn app.main:app --reload --port 8000
# Swagger UI: http://localhost:8000/docs
```

Adding a new dependency:
```bash
uv add <package>   # updates pyproject.toml and uv.lock together
```

Create admin user:
```bash
cd backend && source .venv/bin/activate
python scripts/create_admin.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
npm run build  # output to dist/
```

### Frontend linting / formatting
```bash
cd frontend
npx prettier --write src/   # format all source files
npx eslint src/ --fix       # lint and auto-fix
```

### Docker (full stack)
```bash
cp .env.example .env  # set DATABASE_URL, SECRET_KEY, RAWG_API_KEY
docker compose up
```

### Code quality (pre-commit)
```bash
pip install pre-commit
pre-commit install           # install git hooks
pre-commit run --all-files   # run all hooks manually
```

Hooks: `check-yaml`, `check-toml`, `check-json`, `detect-private-key`, `end-of-file-fixer`, `trailing-whitespace`, `ruff` (lint + fix), `ruff-format`, `mypy`, `prettier`, `eslint`.

## Architecture

### Backend (`backend/app/`)
- `main.py` — FastAPI app, CORS config, router registration
- `config.py` — Settings via pydantic-settings (reads `.env`)
- `database.py` — SQLAlchemy async session setup
- `auth.py` — JWT creation/validation, bcrypt password check, `get_current_user` dependency
- `models/` — SQLAlchemy ORM: `User`, `Post`, `Tag` (with `post_tags` many-to-many junction), `Page`, `NavLink`, `SocialLink`, `VisitedCountry`
- `models/site_profile.py` — `SiteProfile` (singleton row: `id=1`, `photo_url`, `bio`)
- `schemas/` — Pydantic input/output schemas for posts, tags, auth, pages, nav_link, social_link, visited_country
- `schemas/site_profile.py` — `SiteProfileOut`, `SiteProfileUpdate`
- `routers/posts.py` — Public endpoints (list/view posts, list tags)
- `routers/pages.py` — Public endpoints (list/view published pages)
- `routers/nav.py` — Public `GET /api/nav-links` (published pages only, ordered by position)
- `routers/social.py` — Public `GET /api/social-links` (all social links ordered by position)
- `routers/letterboxd.py` — Public `GET /api/letterboxd` (last 5 rated films from Letterboxd RSS; cached 1 hour in memory)
- `routers/travels.py` — Public `GET /api/travels` (all visited countries sorted by name)
- `routers/profile.py` — Public `GET /api/profile` (returns SiteProfile row or empty defaults)
- `routers/auth.py` — `POST /api/auth/login` returns JWT
- `routers/rawg.py` — Public `GET /api/rawg/search?q=` (search games via RAWG API) and `GET /api/rawg/games/{game_id}` (fetch game detail); game detail responses cached in memory for 1 hour; requires `RAWG_API_KEY` in config (defaults to empty string — endpoints return 503 if key is missing)
- `routers/admin.py` — Protected CRUD for posts, tags, pages, nav links, social links, and visited countries; profile GET/PUT and photo upload POST (requires `get_current_user` dependency)

Route protection pattern: admin routes use `Depends(get_current_user)` from `auth.py`.

### Frontend (`frontend/src/`)
- `api/client.js` — Axios instance: request interceptor adds `Authorization: Bearer <token>`, response interceptor redirects to `/login` on 401
- `App.jsx` — React Router v6 routes; admin routes wrapped in `<ProtectedRoute>`
- `pages/admin/PostEditor.jsx` — Uses `@uiw/react-md-editor` for markdown editing
- `pages/admin/PageEditor.jsx` — Markdown editor for Pages (same pattern as PostEditor)
- `pages/admin/NavSettings.jsx` — Self-contained component for managing navbar links (add, remove, reorder)
- `pages/Post.jsx` — Renders markdown with `react-markdown` + `remark-gfm`
- `components/Navbar.jsx` — Fetches `/api/nav-links` on mount and renders center nav links between logo and auth section
- `components/Footer.jsx` — Sticky footer; fetches `/api/social-links` and renders brand icons (Font Awesome) + copyright + back-to-top
- `components/LetterboxdWidget.jsx` — Sidebar widget; fetches `/api/letterboxd` and renders last 5 rated films
- `pages/Travels.jsx` — Interactive world map at `/travels`; uses `react-simple-maps` with zoom/pan, highlights visited countries, shows hover tooltip
- `pages/admin/SocialSettings.jsx` — Manage social links (add, remove, reorder) within the Settings tab
- `pages/admin/TravelSettings.jsx` — Manage visited countries (searchable combobox to add, remove) within the Travels tab
- `components/BioWidget.jsx` — Sidebar widget; fetches `/api/profile` and renders photo + bio
- `pages/admin/BioSettings.jsx` — Bio/photo settings in the Settings tab; supports URL paste or file upload; shows circular preview with remove button

### Database Migrations
Add a new migration:
```bash
cd backend && source .venv/bin/activate  # or use `uv run` prefix
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Key Conventions
- **Backend type annotations**: all functions have return type annotations; `disallow_untyped_defs = true` is enforced by mypy. FastAPI route functions that return ORM objects directly use `# type: ignore[return-value]` on the return line — FastAPI handles ORM→Pydantic coercion via `from_attributes = True`; mypy cannot see this.
- **Frontend code style**: Prettier enforces single quotes, no semicolons, `printWidth: 100`, ES5 trailing commas. ESLint uses `eslint-plugin-react` + `eslint-plugin-react-hooks` recommended rules, with `react/react-in-jsx-scope`, `react/prop-types`, and `react-hooks/set-state-in-effect` disabled.
- **Async SQLAlchemy**: all DB calls use `select()` + `await db.execute()`; `SessionLocal` uses `expire_on_commit=False`; the Post↔Tag M2M relationship uses `lazy="selectin"` on both sides to avoid lazy-load errors in async context
- `DATABASE_URL` must use the `postgresql+asyncpg://` driver prefix (not `postgresql://`); the engine is configured with `connect_args={"ssl": True}` for Neon's required SSL
- Post slugs are auto-generated from titles via `python-slugify`
- Page slugs are set manually and validated as lowercase alphanumeric + hyphens
- Unpublished posts/pages are hidden from public routes; admin can toggle publish status
- Nav links reference published Pages; unpublished pages are hidden from the public nav endpoint but remain in the admin list with a "Draft — hidden from nav" badge
- `NavLink.position` determines navbar order; `PUT /api/admin/nav-links/reorder` accepts the full ordered list of IDs
- Deleting a Page cascades to remove its `NavLink` row automatically (`ondelete="CASCADE"`)
- JWT tokens expire in 480 minutes; token stored as `token` key in localStorage
- CORS origins: `localhost`, `localhost:5173`, `blog.whoisrgj.com`
- `SocialLink.position` determines footer icon order; `PUT /api/admin/social-links/reorder` accepts the full ordered list of IDs
- World-atlas country IDs are zero-padded 3-digit strings (e.g. `"076"` for Brazil); `VisitedCountry.iso_numeric` is padded on the frontend before comparing with `geo.id`
- Letterboxd feed is cached in memory for 1 hour; stale cache is served on fetch failure
- RAWG game detail responses are cached in memory for 1 hour (`_game_cache` dict in `routers/rawg.py`); `RAWG_API_KEY` is optional — if empty, RAWG endpoints will fail at the API call level with a 503
- `PostMedia` model (`models/post_media.py`) stores game metadata linked to a post; `external_id` holds the RAWG game ID
- **Third-party API proxy security**: search/lookup endpoints used only in the admin editor require `Depends(get_current_user)`; public-facing detail endpoints (e.g. `GET /rawg/games/{game_id}`) must validate the requested ID exists in `post_media` before proxying to the external API — this prevents arbitrary enumeration of third-party IDs using the site's API key. Apply this pattern to all future third-party API integrations.
- `UPLOAD_DIR` config field defaults to `"uploads"` locally, overridden to `/app/uploads` in Docker via `docker-compose.yml`; directory is created at startup and served as static files at `/api/uploads` via FastAPI `StaticFiles` mount in `main.py`
- Uploaded profile photo is stored as `profile.<ext>` (previous file deleted on re-upload); `photo_url` saved as `/api/uploads/profile.<ext>`; BioSettings URL input is disabled when a locally-uploaded photo is active
