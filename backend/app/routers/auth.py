from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import create_access_token, verify_password
from app.database import get_db
from app.limiter import limiter
from app.models.user import User
from app.schemas.auth import LoginRequest, Token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(request: Request, credentials: LoginRequest, db: AsyncSession = Depends(get_db)) -> Token:
    user = (await db.execute(select(User).where(User.username == credentials.username))).scalar_one_or_none()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(data={"sub": user.username})
    return Token(access_token=token, token_type="bearer")
