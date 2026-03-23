from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from dotenv import load_dotenv
from app.database import get_db
from app import models
import os

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-fallback-secret-key-123456789")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
bearer_scheme = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    """
    Verifies local JWT, extracts user email, and returns ORM object.
    """
    payload = verify_access_token(credentials.credentials)

    email: str = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing subject"
        )

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in database."
        )

    return user


def get_current_active_user(
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    """
    Extend this later to check if user is banned/deactivated.
    """
    return current_user


def require_admin(
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    """
    Admin-only routes (products CRUD, order management, ticket management).
    Checks the is_admin field on the User model.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user