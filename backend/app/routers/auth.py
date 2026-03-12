from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import create_access_token, verify_password
from app.config import settings
from app.database import get_db
from app.limiter import limiter
from app.models.user import User
from app.schemas.auth import LoginRequest

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_auth_cookie(response: Response, value: str, secure: bool, max_age: int) -> None:
    response.set_cookie(
        key="access_token",
        value=value,
        httponly=True,
        samesite="lax",
        path="/",
        secure=secure,
        max_age=max_age,
    )


def _delete_auth_cookie(response: Response, secure: bool) -> None:
    response.delete_cookie(key="access_token", httponly=True, samesite="lax", path="/", secure=secure)


@router.post("/login")
@limiter.limit("5/minute")
async def login(
    request: Request,
    response: Response,
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    user = (await db.execute(select(User).where(User.username == credentials.username))).scalar_one_or_none()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(data={"sub": user.username})
    _set_auth_cookie(
        response,
        value=token,
        secure=settings.ENVIRONMENT != "development",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return {"message": "Login successful"}


@router.post("/logout")
async def logout(response: Response) -> dict[str, str]:
    _delete_auth_cookie(response, secure=settings.ENVIRONMENT != "development")
    return {"message": "Logged out"}
