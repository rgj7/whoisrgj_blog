from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from slugify import slugify
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.config import settings
from app.database import get_db
from app.models.nav_link import NavLink
from app.models.page import Page
from app.models.post import Post
from app.models.post_media import PostMedia
from app.models.site_profile import SiteProfile
from app.models.social_link import SocialLink
from app.models.tag import Tag
from app.models.user import User
from app.models.visited_country import VisitedCountry
from app.models.wanted_country import WantedCountry
from app.schemas.nav_link import NavLinkAdd, NavLinkOut, NavLinkReorder
from app.schemas.page import PageCreate, PageOut, PageSummary, PageUpdate
from app.schemas.post import PostCreate, PostOut, PostSummary, PostUpdate
from app.schemas.post_media import PostMediaIn
from app.schemas.site_profile import SiteProfileOut, SiteProfileUpdate
from app.schemas.social_link import SocialLinkCreate, SocialLinkOut, SocialLinkReorder
from app.schemas.tag import TagCreate, TagOut
from app.schemas.visited_country import VisitedCountryCreate, VisitedCountryOut
from app.schemas.wanted_country import WantedCountryCreate, WantedCountryOut

router = APIRouter(prefix="/admin", tags=["admin"])


def require_auth(current_user: User = Depends(get_current_user)) -> User:
    return current_user


# --- Posts ---


@router.get("/posts", response_model=list[PostSummary])
async def admin_list_posts(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> list[PostSummary]:
    return (await db.execute(select(Post).order_by(Post.created_at.desc()))).scalars().all()  # type: ignore[return-value]


@router.get("/posts/{post_id}", response_model=PostOut)
async def admin_get_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> PostOut:
    post = (await db.execute(select(Post).where(Post.id == post_id))).scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post  # type: ignore[return-value]


@router.post("/posts", response_model=PostOut, status_code=201)
async def admin_create_post(
    payload: PostCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> PostOut:
    slug = await _unique_slug(db, payload.title)
    tags = await _resolve_tags(db, payload.tag_ids)
    post = Post(
        title=payload.title,
        slug=slug,
        content=payload.content,
        excerpt=payload.excerpt,
        published=payload.published,
        tags=tags,
        media=_build_media(payload.media),
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post  # type: ignore[return-value]


@router.put("/posts/{post_id}", response_model=PostOut)
async def admin_update_post(
    post_id: int,
    payload: PostUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> PostOut:
    post = (await db.execute(select(Post).where(Post.id == post_id))).scalar_one_or_none()
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
        post.tags = await _resolve_tags(db, payload.tag_ids)
    if payload.media is not None:
        post.media = _build_media(payload.media)

    await db.commit()
    await db.refresh(post)
    return post  # type: ignore[return-value]


@router.delete("/posts/{post_id}", status_code=204)
async def admin_delete_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> None:
    post = (await db.execute(select(Post).where(Post.id == post_id))).scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    await db.delete(post)
    await db.commit()


# --- Tags ---


@router.post("/tags", response_model=TagOut, status_code=201)
async def admin_create_tag(
    payload: TagCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> TagOut:
    slug = slugify(payload.name)
    existing = (await db.execute(select(Tag).where(Tag.slug == slug))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Tag already exists")
    tag = Tag(name=payload.name, slug=slug)
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    return tag  # type: ignore[return-value]


@router.delete("/tags/{tag_id}", status_code=204)
async def admin_delete_tag(
    tag_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> None:
    tag = (await db.execute(select(Tag).where(Tag.id == tag_id))).scalar_one_or_none()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    await db.delete(tag)
    await db.commit()


# --- Pages ---


@router.get("/pages", response_model=list[PageSummary])
async def admin_list_pages(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> list[PageSummary]:
    return (await db.execute(select(Page).order_by(Page.created_at.desc()))).scalars().all()  # type: ignore[return-value]


@router.get("/pages/{page_id}", response_model=PageOut)
async def admin_get_page(
    page_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> PageOut:
    page = (await db.execute(select(Page).where(Page.id == page_id))).scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page  # type: ignore[return-value]


@router.post("/pages", response_model=PageOut, status_code=201)
async def admin_create_page(
    payload: PageCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> PageOut:
    existing = (await db.execute(select(Page).where(Page.slug == payload.slug))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="A page with this slug already exists")
    page = Page(
        title=payload.title,
        slug=payload.slug,
        content=payload.content,
        published=payload.published,
    )
    db.add(page)
    await db.commit()
    await db.refresh(page)
    return page  # type: ignore[return-value]


@router.put("/pages/{page_id}", response_model=PageOut)
async def admin_update_page(
    page_id: int,
    payload: PageUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> PageOut:
    page = (await db.execute(select(Page).where(Page.id == page_id))).scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    if payload.slug is not None and payload.slug != page.slug:
        conflict = (await db.execute(select(Page).where(Page.slug == payload.slug))).scalar_one_or_none()
        if conflict:
            raise HTTPException(status_code=409, detail="A page with this slug already exists")
        page.slug = payload.slug
    if payload.title is not None:
        page.title = payload.title
    if payload.content is not None:
        page.content = payload.content
    if payload.published is not None:
        page.published = payload.published

    await db.commit()
    await db.refresh(page)
    return page  # type: ignore[return-value]


@router.delete("/pages/{page_id}", status_code=204)
async def admin_delete_page(
    page_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> None:
    page = (await db.execute(select(Page).where(Page.id == page_id))).scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    await db.delete(page)
    await db.commit()


# --- Nav Links ---


@router.get("/nav-links", response_model=list[NavLinkOut])
async def admin_list_nav_links(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> list[NavLinkOut]:
    return (await db.execute(select(NavLink).order_by(NavLink.position.asc()))).scalars().all()  # type: ignore[return-value]


@router.post("/nav-links", response_model=NavLinkOut, status_code=201)
async def admin_add_nav_link(
    payload: NavLinkAdd,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> NavLinkOut:
    count = (await db.execute(select(func.count()).select_from(NavLink))).scalar()
    if payload.page_id is not None:
        page = (await db.execute(select(Page).where(Page.id == payload.page_id))).scalar_one_or_none()
        if not page or not page.published:
            raise HTTPException(status_code=404, detail="Published page not found")
        existing = (await db.execute(select(NavLink).where(NavLink.page_id == payload.page_id))).scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=409, detail="Page is already in the nav")
        nav_link = NavLink(page_id=payload.page_id, position=(count or 0) + 1)
    else:
        nav_link = NavLink(
            page_id=None,
            custom_label=payload.custom_label,
            custom_url=payload.custom_url,
            position=(count or 0) + 1,
        )
    db.add(nav_link)
    await db.commit()
    await db.refresh(nav_link)
    return nav_link  # type: ignore[return-value]


@router.delete("/nav-links/{nav_link_id}", status_code=204)
async def admin_delete_nav_link(
    nav_link_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> None:
    nav_link = (await db.execute(select(NavLink).where(NavLink.id == nav_link_id))).scalar_one_or_none()
    if not nav_link:
        raise HTTPException(status_code=404, detail="Nav link not found")
    await db.delete(nav_link)
    await db.commit()


@router.put("/nav-links/reorder", response_model=list[NavLinkOut])
async def admin_reorder_nav_links(
    payload: NavLinkReorder,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> list[NavLinkOut]:
    all_nav_links = (await db.execute(select(NavLink))).scalars().all()
    existing_ids = {nl.id for nl in all_nav_links}
    if set(payload.ordered_ids) != existing_ids:
        raise HTTPException(
            status_code=400,
            detail="ordered_ids must contain exactly all current nav link IDs",
        )
    id_to_link = {nl.id: nl for nl in all_nav_links}
    for position, nav_link_id in enumerate(payload.ordered_ids, start=1):
        id_to_link[nav_link_id].position = position
    await db.commit()
    return (await db.execute(select(NavLink).order_by(NavLink.position.asc()))).scalars().all()  # type: ignore[return-value]


# --- Social Links ---


@router.get("/social-links", response_model=list[SocialLinkOut])
async def admin_list_social_links(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> list[SocialLinkOut]:
    return (await db.execute(select(SocialLink).order_by(SocialLink.position.asc()))).scalars().all()  # type: ignore[return-value]


@router.post("/social-links", response_model=SocialLinkOut, status_code=201)
async def admin_add_social_link(
    payload: SocialLinkCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> SocialLinkOut:
    count = (await db.execute(select(func.count()).select_from(SocialLink))).scalar()
    social_link = SocialLink(platform=payload.platform, url=payload.url, position=(count or 0) + 1)
    db.add(social_link)
    await db.commit()
    await db.refresh(social_link)
    return social_link  # type: ignore[return-value]


@router.delete("/social-links/{social_link_id}", status_code=204)
async def admin_delete_social_link(
    social_link_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> None:
    social_link = (await db.execute(select(SocialLink).where(SocialLink.id == social_link_id))).scalar_one_or_none()
    if not social_link:
        raise HTTPException(status_code=404, detail="Social link not found")
    await db.delete(social_link)
    await db.commit()


@router.put("/social-links/reorder", response_model=list[SocialLinkOut])
async def admin_reorder_social_links(
    payload: SocialLinkReorder,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> list[SocialLinkOut]:
    all_links = (await db.execute(select(SocialLink))).scalars().all()
    existing_ids = {sl.id for sl in all_links}
    if set(payload.ordered_ids) != existing_ids:
        raise HTTPException(
            status_code=400,
            detail="ordered_ids must contain exactly all current social link IDs",
        )
    id_to_link = {sl.id: sl for sl in all_links}
    for position, social_link_id in enumerate(payload.ordered_ids, start=1):
        id_to_link[social_link_id].position = position
    await db.commit()
    return (await db.execute(select(SocialLink).order_by(SocialLink.position.asc()))).scalars().all()  # type: ignore[return-value]


# --- Travels ---


@router.get("/travels", response_model=list[VisitedCountryOut])
async def admin_list_visited_countries(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> list[VisitedCountryOut]:
    return (await db.execute(select(VisitedCountry).order_by(VisitedCountry.name.asc()))).scalars().all()  # type: ignore[return-value]


@router.post("/travels", response_model=VisitedCountryOut, status_code=201)
async def admin_add_visited_country(
    payload: VisitedCountryCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> VisitedCountryOut:
    existing = (
        await db.execute(select(VisitedCountry).where(VisitedCountry.iso_numeric == payload.iso_numeric))
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Country already in visited list")
    if (
        await db.execute(select(WantedCountry).where(WantedCountry.iso_numeric == payload.iso_numeric))
    ).scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Country is already in your wishlist")
    country = VisitedCountry(name=payload.name, iso_numeric=payload.iso_numeric)
    db.add(country)
    await db.commit()
    await db.refresh(country)
    return country  # type: ignore[return-value]


@router.delete("/travels/{country_id}", status_code=204)
async def admin_delete_visited_country(
    country_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> None:
    country = (await db.execute(select(VisitedCountry).where(VisitedCountry.id == country_id))).scalar_one_or_none()
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")
    await db.delete(country)
    await db.commit()


# --- Travels Wishlist ---


@router.get("/travels/wishlist", response_model=list[WantedCountryOut])
async def admin_list_wanted_countries(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> list[WantedCountryOut]:
    return (await db.execute(select(WantedCountry).order_by(WantedCountry.name.asc()))).scalars().all()  # type: ignore[return-value]


@router.post("/travels/wishlist", response_model=WantedCountryOut, status_code=201)
async def admin_add_wanted_country(
    payload: WantedCountryCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> WantedCountryOut:
    existing = (
        await db.execute(select(WantedCountry).where(WantedCountry.iso_numeric == payload.iso_numeric))
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Country already in wishlist")
    if (
        await db.execute(select(VisitedCountry).where(VisitedCountry.iso_numeric == payload.iso_numeric))
    ).scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Country is already in your visited list")
    country = WantedCountry(name=payload.name, iso_numeric=payload.iso_numeric)
    db.add(country)
    await db.commit()
    await db.refresh(country)
    return country  # type: ignore[return-value]


@router.delete("/travels/wishlist/{country_id}", status_code=204)
async def admin_delete_wanted_country(
    country_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> None:
    country = (await db.execute(select(WantedCountry).where(WantedCountry.id == country_id))).scalar_one_or_none()
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")
    await db.delete(country)
    await db.commit()


# --- Profile ---


@router.get("/profile", response_model=SiteProfileOut)
async def admin_get_profile(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> SiteProfileOut:
    profile = (await db.execute(select(SiteProfile).where(SiteProfile.id == 1))).scalar_one_or_none()
    if not profile:
        return SiteProfileOut()
    return profile  # type: ignore[return-value]


@router.put("/profile", response_model=SiteProfileOut)
async def admin_update_profile(
    payload: SiteProfileUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> SiteProfileOut:
    profile = SiteProfile(id=1, photo_url=payload.photo_url, bio=payload.bio)
    profile = await db.merge(profile)
    await db.commit()
    await db.refresh(profile)
    return profile  # type: ignore[return-value]


@router.post("/profile/photo", response_model=SiteProfileOut)
async def admin_upload_profile_photo(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_auth),
) -> SiteProfileOut:
    if file.content_type not in ("image/jpeg", "image/png", "image/gif", "image/webp"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    ext = "jpg" if file.content_type == "image/jpeg" else file.content_type.split("/")[1]

    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    for old in upload_dir.glob("profile.*"):
        old.unlink(missing_ok=True)

    dest = upload_dir / f"profile.{ext}"
    dest.write_bytes(await file.read())

    photo_url = f"/api/uploads/profile.{ext}"
    profile = (await db.execute(select(SiteProfile).where(SiteProfile.id == 1))).scalar_one_or_none()
    if profile is None:
        profile = SiteProfile(id=1, photo_url=photo_url)
        db.add(profile)
    else:
        profile.photo_url = photo_url
    await db.commit()
    await db.refresh(profile)
    return profile  # type: ignore[return-value]


# --- Helpers ---


async def _unique_slug(db: AsyncSession, title: str) -> str:
    base = slugify(title)
    slug = base
    counter = 1
    while (await db.execute(select(Post).where(Post.slug == slug))).scalar_one_or_none():
        slug = f"{base}-{counter}"
        counter += 1
    return slug


async def _resolve_tags(db: AsyncSession, tag_ids: list[int]) -> list[Tag]:
    if not tag_ids:
        return []
    tags = list((await db.execute(select(Tag).where(Tag.id.in_(tag_ids)))).scalars().all())
    if len(tags) != len(tag_ids):
        raise HTTPException(status_code=400, detail="One or more tag IDs are invalid")
    return tags


def _build_media(items: list[PostMediaIn]) -> list[PostMedia]:
    return [PostMedia(media_type=m.media_type, external_id=m.external_id, title=m.title) for m in items]
