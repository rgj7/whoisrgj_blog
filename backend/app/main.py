from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import posts, admin, auth, pages, nav, social, letterboxd, travels, profile
from app.config import settings

app = FastAPI(title="whoisrgj Blog API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:5173", "https://whoisrgj.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(posts.router, prefix="/api")
app.include_router(pages.router, prefix="/api")
app.include_router(nav.router, prefix="/api")
app.include_router(social.router, prefix="/api")
app.include_router(letterboxd.router, prefix="/api")
app.include_router(travels.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(auth.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "whoisrgj Blog API"}
