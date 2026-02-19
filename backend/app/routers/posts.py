import math
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.post import Post
from app.models.tag import Tag
from app.schemas.post import PostOut, PostSummary, PaginatedPosts
from app.schemas.tag import TagOut

router = APIRouter(tags=["public"])


@router.get("/posts", response_model=PaginatedPosts)
def list_posts(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    tag: str | None = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Post).filter(Post.published == True)  # noqa: E712
    if tag:
        query = query.join(Post.tags).filter(Tag.slug == tag)
    total = query.count()
    posts = query.order_by(Post.created_at.desc()).offset((page - 1) * size).limit(size).all()
    return PaginatedPosts(
        items=posts,
        total=total,
        page=page,
        size=size,
        pages=math.ceil(total / size) if total else 1,
    )


@router.get("/posts/{slug}", response_model=PostOut)
def get_post(slug: str, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.slug == slug, Post.published == True).first()  # noqa: E712
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.get("/tags", response_model=list[TagOut])
def list_tags(db: Session = Depends(get_db)):
    return db.query(Tag).order_by(Tag.name).all()
