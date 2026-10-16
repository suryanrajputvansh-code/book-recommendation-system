import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Request, HTTPException, status, Depends
from sqlalchemy.orm import Session
from backend.config import settings
from backend.database import get_db, User


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: int, email: str = "", name: str = "") -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=settings.JWT_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),
        "email": email,
        "name": name,
        "iat": now,
        "exp": expire
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token_payload(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except Exception:
        return None


def decode_access_token(token: str) -> Optional[int]:
    payload = decode_token_payload(token)
    if payload:
        user_id_str = payload.get("sub")
        if user_id_str and str(user_id_str).isdigit():
            return int(user_id_str)
    return None


def get_token_from_request(request: Request) -> Optional[str]:
    # Check cookie first
    token = request.cookies.get("access_token")
    if token:
        # If stored with Bearer prefix in cookie, strip it
        if token.startswith("Bearer "):
            token = token[7:]
        return token

    # Check Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:]

    return None


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = get_token_from_request(request)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    payload = decode_token_payload(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )
    user_id_str = payload.get("sub")
    user_id = int(user_id_str) if user_id_str and str(user_id_str).isdigit() else None
    email = payload.get("email")
    name = payload.get("name")

    user = None
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
    if not user and email:
        user = db.query(User).filter(User.email == email).first()

    # If database was recycled on serverless cold starts, auto-recreate the user
    if not user and email:
        try:
            user = User(
                email=email,
                name=name or email.split("@")[0],
                created_at=datetime.utcnow()
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        except Exception:
            db.rollback()
            user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists"
        )
    return user


def get_optional_current_user(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    token = get_token_from_request(request)
    if not token:
        return None
    payload = decode_token_payload(token)
    if not payload:
        return None
    user_id_str = payload.get("sub")
    user_id = int(user_id_str) if user_id_str and str(user_id_str).isdigit() else None
    email = payload.get("email")
    name = payload.get("name")

    user = None
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
    if not user and email:
        user = db.query(User).filter(User.email == email).first()

    if not user and email:
        try:
            user = User(
                email=email,
                name=name or email.split("@")[0],
                created_at=datetime.utcnow()
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        except Exception:
            db.rollback()
            user = db.query(User).filter(User.email == email).first()

    return user
