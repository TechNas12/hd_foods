from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from dotenv import load_dotenv
from app.database import get_db
from app import models
import os

load_dotenv()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
ALGORITHM = "HS256"

# Extracts Bearer token from Authorization header
bearer_scheme = HTTPBearer()


def verify_supabase_token(credentials: HTTPAuthorizationCredentials) -> dict:
    """
    Decodes and verifies the Supabase JWT token.
    Raises 401 if token is invalid or expired.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=[ALGORITHM],
            options={"verify_aud": False}  # Supabase uses custom audience
        )
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
    1. Verifies the Supabase JWT
    2. Extracts the user's email from the token payload
    3. Looks up the user in YOUR local DB
    4. Returns the User ORM object to the route
    """
    payload = verify_supabase_token(credentials)

    email: str = payload.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing email"
        )

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in database. Please complete registration."
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
    Placeholder for admin-only routes (products CRUD, order management).
    Add an `is_admin` column to User model when needed.
    """
    # TODO: Add is_admin check when admin panel is built
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Admins only")
    return current_user