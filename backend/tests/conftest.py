import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.pool import StaticPool

from app.auth import create_access_token, get_password_hash
from app.database import Base, get_db
from app.limiter import limiter
from app.main import app
from app.models.user import User


@pytest.fixture
async def engine():
    """Fresh in-memory SQLite engine per test — no shared state between tests."""
    _engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    @event.listens_for(_engine.sync_engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield _engine

    await _engine.dispose()


@pytest.fixture
async def db_session(engine):
    session = AsyncSession(engine, expire_on_commit=False)
    yield session
    await session.close()


@pytest.fixture
async def client(db_session):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
async def admin_user(db_session):
    user = User(
        username="testadmin",
        hashed_password=get_password_hash("testpassword"),
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
def admin_token(admin_user):
    return create_access_token({"sub": admin_user.username})


@pytest.fixture
def auth_cookies(admin_token):
    return {"access_token": admin_token}


@pytest.fixture(autouse=True)
def disable_rate_limits():
    limiter._storage.reset()
    yield
    limiter._storage.reset()
