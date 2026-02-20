from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from slugify import slugify
from app.database import get_db
from app.models.post import Post
from app.models.tag import Tag
from app.models.user import User
from app.models.page import Page
from app.models.nav_link import NavLink
from app.models.social_link import SocialLink
from app.models.visited_country import VisitedCountry
from app.schemas.post import PostCreate, PostUpdate, PostOut, PostSummary
from app.schemas.tag import TagCreate, TagOut
from app.schemas.page import PageCreate, PageUpdate, PageOut, PageSummary
from app.schemas.nav_link import NavLinkOut, NavLinkAdd, NavLinkReorder
from app.schemas.social_link import SocialLinkOut, SocialLinkCreate, SocialLinkReorder
from app.schemas.visited_country import VisitedCountryOut, VisitedCountryCreate
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


# --- Nav Links ---

@router.get("/nav-links", response_model=list[NavLinkOut])
def admin_list_nav_links(
    db: Session = Depends(get_db),
    _: User = Depends(require_auth),
):
    return db.query(NavLink).order_by(NavLink.position.asc()).all()


@router.post("/nav-links", response_model=NavLinkOut, status_code=201)
def admin_add_nav_link(
    payload: NavLinkAdd,
    db: Session = Depends(get_db),
    _: User = Depends(require_auth),
):
    page = db.query(Page).filter(Page.id == payload.page_id).first()
    if not page or not page.published:
        raise HTTPException(status_code=404, detail="Published page not found")
    existing = db.query(NavLink).filter(NavLink.page_id == payload.page_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Page is already in the nav")
    count = db.query(NavLink).count()
    nav_link = NavLink(page_id=payload.page_id, position=count + 1)
    db.add(nav_link)
    db.commit()
    db.refresh(nav_link)
    return nav_link


@router.delete("/nav-links/{nav_link_id}", status_code=204)
def admin_delete_nav_link(
    nav_link_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_auth),
):
    nav_link = db.query(NavLink).filter(NavLink.id == nav_link_id).first()
    if not nav_link:
        raise HTTPException(status_code=404, detail="Nav link not found")
    db.delete(nav_link)
    db.commit()


@router.put("/nav-links/reorder", response_model=list[NavLinkOut])
def admin_reorder_nav_links(
    payload: NavLinkReorder,
    db: Session = Depends(get_db),
    _: User = Depends(require_auth),
):
    all_nav_links = db.query(NavLink).all()
    existing_ids = {nl.id for nl in all_nav_links}
    if set(payload.ordered_ids) != existing_ids:
        raise HTTPException(
            status_code=400,
            detail="ordered_ids must contain exactly all current nav link IDs",
        )
    id_to_link = {nl.id: nl for nl in all_nav_links}
    for position, nav_link_id in enumerate(payload.ordered_ids, start=1):
        id_to_link[nav_link_id].position = position
    db.commit()
    return db.query(NavLink).order_by(NavLink.position.asc()).all()


# --- Social Links ---

@router.get("/social-links", response_model=list[SocialLinkOut])
def admin_list_social_links(
    db: Session = Depends(get_db),
    _: User = Depends(require_auth),
):
    return db.query(SocialLink).order_by(SocialLink.position.asc()).all()


@router.post("/social-links", response_model=SocialLinkOut, status_code=201)
def admin_add_social_link(
    payload: SocialLinkCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_auth),
):
    count = db.query(SocialLink).count()
    social_link = SocialLink(platform=payload.platform, url=payload.url, position=count + 1)
    db.add(social_link)
    db.commit()
    db.refresh(social_link)
    return social_link


@router.delete("/social-links/{social_link_id}", status_code=204)
def admin_delete_social_link(
    social_link_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_auth),
):
    social_link = db.query(SocialLink).filter(SocialLink.id == social_link_id).first()
    if not social_link:
        raise HTTPException(status_code=404, detail="Social link not found")
    db.delete(social_link)
    db.commit()


@router.put("/social-links/reorder", response_model=list[SocialLinkOut])
def admin_reorder_social_links(
    payload: SocialLinkReorder,
    db: Session = Depends(get_db),
    _: User = Depends(require_auth),
):
    all_links = db.query(SocialLink).all()
    existing_ids = {sl.id for sl in all_links}
    if set(payload.ordered_ids) != existing_ids:
        raise HTTPException(
            status_code=400,
            detail="ordered_ids must contain exactly all current social link IDs",
        )
    id_to_link = {sl.id: sl for sl in all_links}
    for position, social_link_id in enumerate(payload.ordered_ids, start=1):
        id_to_link[social_link_id].position = position
    db.commit()
    return db.query(SocialLink).order_by(SocialLink.position.asc()).all()


# --- Travels ---

@router.get("/travels", response_model=list[VisitedCountryOut])
def admin_list_visited_countries(
    db: Session = Depends(get_db),
    _: User = Depends(require_auth),
):
    return db.query(VisitedCountry).order_by(VisitedCountry.name.asc()).all()


@router.post("/travels", response_model=VisitedCountryOut, status_code=201)
def admin_add_visited_country(
    payload: VisitedCountryCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_auth),
):
    existing = db.query(VisitedCountry).filter(VisitedCountry.iso_numeric == payload.iso_numeric).first()
    if existing:
        raise HTTPException(status_code=409, detail="Country already added")
    country = VisitedCountry(name=payload.name, iso_numeric=payload.iso_numeric)
    db.add(country)
    db.commit()
    db.refresh(country)
    return country


@router.delete("/travels/{country_id}", status_code=204)
def admin_delete_visited_country(
    country_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_auth),
):
    country = db.query(VisitedCountry).filter(VisitedCountry.id == country_id).first()
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")
    db.delete(country)
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
