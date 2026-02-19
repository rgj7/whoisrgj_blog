from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from slugify import slugify
from app.database import get_db
from app.models.post import Post
from app.models.tag import Tag
from app.models.user import User
from app.schemas.post import PostCreate, PostUpdate, PostOut, PostSummary
from app.schemas.tag import TagCreate, TagOut
from app.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])


def require_auth(current_user: User = Depends(get_current_user)) -> User:
    return current_user


# --- Posts ---

@router.get("/posts", response_model=list[PostSummary])
def admin_list_posts(
    db: Session = Depends(get_db),
    _: User = Depends(require_auth),
):
    return db.query(Post).order_by(Post.created_at.desc()).all()


@router.get("/posts/{post_id}", response_model=PostOut)
def admin_get_post(
    post_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_auth),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("/posts", response_model=PostOut, status_code=201)
def admin_create_post(
    payload: PostCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_auth),
):
    slug = _unique_slug(db, payload.title)
    tags = _resolve_tags(db, payload.tag_ids)
    post = Post(
        title=payload.title,
        slug=slug,
        content=payload.content,
        excerpt=payload.excerpt,
        published=payload.published,
        tags=tags,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.put("/posts/{post_id}", response_model=PostOut)
def admin_update_post(
    post_id: int,
    payload: PostUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_auth),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if payload.title is not None:
        post.title = payload.title
    if payload.content is not None:
        post.content = payload.content
    if payload.excerpt is not None:
        post.excerpt = payload.excerpt
    if payload.published is not None:
        post.published = payload.published
    if payload.tag_ids is not None:
        post.tags = _resolve_tags(db, payload.tag_ids)

    db.commit()
    db.refresh(post)
    return post


@router.delete("/posts/{post_id}", status_code=204)
def admin_delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_auth),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()


# --- Tags ---

@router.post("/tags", response_model=TagOut, status_code=201)
def admin_create_tag(
    payload: TagCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_auth),
):
    slug = slugify(payload.name)
    existing = db.query(Tag).filter(Tag.slug == slug).first()
    if existing:
        raise HTTPException(status_code=409, detail="Tag already exists")
    tag = Tag(name=payload.name, slug=slug)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


@router.delete("/tags/{tag_id}", status_code=204)
def admin_delete_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_auth),
):
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    db.delete(tag)
    db.commit()


# --- Helpers ---

def _unique_slug(db: Session, title: str) -> str:
    base = slugify(title)
    slug = base
    counter = 1
    while db.query(Post).filter(Post.slug == slug).first():
        slug = f"{base}-{counter}"
        counter += 1
    return slug


def _resolve_tags(db: Session, tag_ids: list[int]) -> list[Tag]:
    if not tag_ids:
        return []
    tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
    if len(tags) != len(tag_ids):
        raise HTTPException(status_code=400, detail="One or more tag IDs are invalid")
    return tags
