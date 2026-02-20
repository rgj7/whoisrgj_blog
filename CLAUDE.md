# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Backend**: FastAPI + SQLAlchemy + PostgreSQL (Python 3.12+)
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Auth**: JWT tokens (stored in localStorage), bcrypt for password hashing
- **Migrations**: Alembic
- **Deployment**: Docker Compose

## Development Commands

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # set DATABASE_URL and SECRET_KEY
alembic upgrade head  # run migrations
uvicorn app.main:app --reload --port 8000
# Swagger UI: http://localhost:8000/docs
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

### Docker (full stack)
```bash
cp .env.example .env  # set SECRET_KEY
docker compose up
```

## Architecture

### Backend (`backend/app/`)
- `main.py` — FastAPI app, CORS config, router registration
- `config.py` — Settings via pydantic-settings (reads `.env`)
- `database.py` — SQLAlchemy async session setup
- `auth.py` — JWT creation/validation, bcrypt password check, `get_current_user` dependency
- `models/` — SQLAlchemy ORM: `User`, `Post`, `Tag` (with `post_tags` many-to-many junction), `Page`, `NavLink`, `SocialLink`, `VisitedCountry`
- `schemas/` — Pydantic input/output schemas for posts, tags, auth, pages, nav_link, social_link, visited_country
- `routers/posts.py` — Public endpoints (list/view posts, list tags)
- `routers/pages.py` — Public endpoints (list/view published pages)
- `routers/nav.py` — Public `GET /api/nav-links` (published pages only, ordered by position)
- `routers/social.py` — Public `GET /api/social-links` (all social links ordered by position)
- `routers/letterboxd.py` — Public `GET /api/letterboxd` (last 5 rated films from Letterboxd RSS; cached 1 hour in memory)
- `routers/travels.py` — Public `GET /api/travels` (all visited countries sorted by name)
- `routers/auth.py` — `POST /api/auth/login` returns JWT
- `routers/admin.py` — Protected CRUD for posts, tags, pages, nav links, social links, and visited countries (requires `get_current_user` dependency)

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

### Database Migrations
Add a new migration:
```bash
cd backend && source .venv/bin/activate
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Key Conventions
- Post slugs are auto-generated from titles via `python-slugify`
- Page slugs are set manually and validated as lowercase alphanumeric + hyphens
- Unpublished posts/pages are hidden from public routes; admin can toggle publish status
- Nav links reference published Pages; unpublished pages are hidden from the public nav endpoint but remain in the admin list with a "Draft — hidden from nav" badge
- `NavLink.position` determines navbar order; `PUT /api/admin/nav-links/reorder` accepts the full ordered list of IDs
- Deleting a Page cascades to remove its `NavLink` row automatically (`ondelete="CASCADE"`)
- JWT tokens expire in 480 minutes; token stored as `token` key in localStorage
- CORS origins: `localhost`, `localhost:5173`, `whoisrgj.com`
- `SocialLink.position` determines footer icon order; `PUT /api/admin/social-links/reorder` accepts the full ordered list of IDs
- World-atlas country IDs are zero-padded 3-digit strings (e.g. `"076"` for Brazil); `VisitedCountry.iso_numeric` is padded on the frontend before comparing with `geo.id`
- Letterboxd feed is cached in memory for 1 hour; stale cache is served on fetch failure
