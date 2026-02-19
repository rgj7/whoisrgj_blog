#!/usr/bin/env python3
"""
Create an initial admin user.

Usage (from the backend/ directory with .venv activated):
    python scripts/create_admin.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.user import User
from app.auth import get_password_hash


def main():
    username = input("Admin username: ").strip()
    if not username:
        print("Username cannot be empty.")
        sys.exit(1)

    password = input("Admin password: ").strip()
    if len(password) < 8:
        print("Password must be at least 8 characters.")
        sys.exit(1)

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            print(f"User '{username}' already exists.")
            sys.exit(1)

        user = User(username=username, hashed_password=get_password_hash(password))
        db.add(user)
        db.commit()
        print(f"Admin user '{username}' created successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
