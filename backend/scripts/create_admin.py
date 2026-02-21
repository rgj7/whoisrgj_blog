#!/usr/bin/env python3
"""
Create an initial admin user.

Usage (from the backend/ directory with .venv activated):
    python scripts/create_admin.py
"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from app.database import SessionLocal
from app.models.user import User
from app.auth import get_password_hash


async def main():
    username = input("Admin username: ").strip()
    if not username:
        print("Username cannot be empty.")
        sys.exit(1)

    password = input("Admin password: ").strip()
    if len(password) < 8:
        print("Password must be at least 8 characters.")
        sys.exit(1)

    async with SessionLocal() as db:
        existing = (await db.execute(select(User).where(User.username == username))).scalar_one_or_none()
        if existing:
            print(f"User '{username}' already exists.")
            sys.exit(1)

        user = User(username=username, hashed_password=get_password_hash(password))
        db.add(user)
        await db.commit()
        print(f"Admin user '{username}' created successfully.")


if __name__ == "__main__":
    asyncio.run(main())
