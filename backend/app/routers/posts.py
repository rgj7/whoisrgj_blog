import math
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.post import Post
from app.models.tag import Tag
from app.schemas.post import PostOut, PostSummary, PaginatedPosts
from app.schemas.tag import TagOut

router = APIRouter(tags=["public"])


@router.get("/posts", response_model=PaginatedPosts)
async def list_posts(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    tag: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Post).where(Post.published == True)  # noqa: E712
    if tag:
        stmt = stmt.join(Post.tags).where(Tag.slug == tag)
    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar()
    posts = (
        await db.execute(stmt.order_by(Post.created_at.desc()).offset((page - 1) * size).limit(size))
    ).scalars().all()
    return PaginatedPosts(
        items=posts,
        total=total,
        page=page,
        size=size,
        pages=math.ceil(total / size) if total else 1,
    )


@router.get("/posts/{slug}", response_model=PostOut)
async def get_post(slug: str, db: AsyncSession = Depends(get_db)):
    post = (
        await db.execute(select(Post).where(Post.slug == slug, Post.published == True))  # noqa: E712
    ).scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.get("/tags", response_model=list[TagOut])
async def list_tags(db: AsyncSession = Depends(get_db)):
    return (await db.execute(select(Tag).order_by(Tag.name))).scalars().all()
