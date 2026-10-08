import os
import re
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from backend.config import settings
from backend.database import get_db, User
from backend.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class SignupRequest(BaseModel):
    email: str = Field(..., description="User email address")
    name: str = Field(..., description="User full name")
    password: str = Field(..., description="User password (min 8 chars)")


class LoginRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class GoogleAuthRequest(BaseModel):
    credential: str = Field(..., description="Google ID Token from Identity Services")


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    avatar_url: Optional[str] = None


class AuthResponse(BaseModel):
    user: UserResponse


def set_auth_cookie(response: Response, token: str):
    is_production = os.environ.get("VERCEL", "") == "1" or os.environ.get("ENVIRONMENT", "dev").lower() == "production"
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=settings.JWT_EXPIRE_DAYS * 24 * 3600,
        samesite="lax",
        secure=is_production  # Must be True on HTTPS (Vercel/Render)
    )


def validate_email_format(email: str) -> bool:
    email_regex = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    return bool(re.match(email_regex, email))


@router.post("/signup", response_model=AuthResponse)
def signup(payload: SignupRequest, response: Response, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    name = payload.name.strip()
    password = payload.password

    if not validate_email_format(email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid email address."
        )

    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name is required."
        )

    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long."
        )

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="That email is already registered."
        )

    pwd_hash = hash_password(password)
    user = User(
        email=email,
        name=name,
        password_hash=pwd_hash
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    set_auth_cookie(response, token)

    return {"user": UserResponse(id=user.id, email=user.email, name=user.name, avatar_url=user.avatar_url)}


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    password = payload.password

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required."
        )

    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    token = create_access_token(user.id)
    set_auth_cookie(response, token)

    return {"user": UserResponse(id=user.id, email=user.email, name=user.name, avatar_url=user.avatar_url)}


@router.post("/google", response_model=AuthResponse)
def google_auth(payload: GoogleAuthRequest, response: Response, db: Session = Depends(get_db)):
    credential = payload.credential
    if not credential:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google credential token missing."
        )

    client_id = settings.GOOGLE_CLIENT_ID
    if not client_id or "placeholder" in client_id.lower() or "your-google-client-id" in client_id.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google Sign-In is not configured on the server (GOOGLE_CLIENT_ID placeholder)."
        )

    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests

        id_info = id_token.verify_oauth2_token(credential, google_requests.Request(), client_id)
        google_id = id_info.get("sub")
        email = id_info.get("email", "").lower()
        name = id_info.get("name", email.split("@")[0])
        avatar_url = id_info.get("picture")

        if not email or not google_id:
            raise ValueError("Email or Google ID missing from ID token")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Google authentication failed: {str(e)}"
        )

    # Check existing user by google_id or email
    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()
        if user:
            # Link existing account
            user.google_id = google_id
            if avatar_url and not user.avatar_url:
                user.avatar_url = avatar_url
            db.commit()
        else:
            # Create new user
            user = User(
                email=email,
                name=name,
                google_id=google_id,
                avatar_url=avatar_url
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    token = create_access_token(user.id)
    set_auth_cookie(response, token)

    return {"user": UserResponse(id=user.id, email=user.email, name=user.name, avatar_url=user.avatar_url)}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=AuthResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return {"user": UserResponse(id=current_user.id, email=current_user.email, name=current_user.name, avatar_url=current_user.avatar_url)}
