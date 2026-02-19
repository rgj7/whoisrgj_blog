from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from slugify import slugify
from app.database import get_db
from app.models.post import Post
from app.models.tag import Tag
from app.models.user import User
from app.models.page import Page
from app.schemas.post import PostCreate, PostUpdate, PostOut, PostSummary
from app.schemas.tag import TagCreate, TagOut
from app.schemas.page import PageCreate, PageUpdate, PageOut, PageSummary
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


# --- Pages ---

@router.get("/pages", response_model=list[PageSummary])
def admin_list_pages(
    db: Session = Depends(get_db),
    _: User = Depends(require_auth),
):
    return db.query(Page).order_by(Page.created_at.desc()).all()


@router.get("/pages/{page_id}", response_model=PageOut)
def admin_get_page(
    page_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_auth),
):
    page = db.query(Page).filter(Page.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page


@router.post("/pages", response_model=PageOut, status_code=201)
def admin_create_page(
    payload: PageCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_auth),
):
    existing = db.query(Page).filter(Page.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=409, detail="A page with this slug already exists")
    page = Page(
        title=payload.title,
        slug=payload.slug,
        content=payload.content,
        published=payload.published,
    )
    db.add(page)
    db.commit()
    db.refresh(page)
    return page


@router.put("/pages/{page_id}", response_model=PageOut)
def admin_update_page(
    page_id: int,
    payload: PageUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_auth),
):
    page = db.query(Page).filter(Page.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    if payload.slug is not None and payload.slug != page.slug:
        conflict = db.query(Page).filter(Page.slug == payload.slug).first()
        if conflict:
            raise HTTPException(status_code=409, detail="A page with this slug already exists")
        page.slug = payload.slug
    if payload.title is not None:
        page.title = payload.title
    if payload.content is not None:
        page.content = payload.content
    if payload.published is not None:
        page.published = payload.published

    db.commit()
    db.refresh(page)
    return page


@router.delete("/pages/{page_id}", status_code=204)
def admin_delete_page(
    page_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_auth),
):
    page = db.query(Page).filter(Page.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    db.delete(page)
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
