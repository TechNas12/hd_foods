from pydantic import BaseModel, EmailStr, field_validator, model_validator, ConfigDict
from datetime import datetime
from typing import Optional
import re


# ─────────────────────────────────────────────
# Shared soft-delete mixin for all responses
# ─────────────────────────────────────────────
from app.schemas.common import SoftDeleteMixin


from app.schemas.address import AddressResponse, AddressCreate, AddressUpdate


# ─────────────────────────────────────────────
# USER SCHEMAS
# ─────────────────────────────────────────────
class UserBase(BaseModel):
    full_name: str
    email:     EmailStr
    phone:     Optional[str] = None

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Full name must be at least 2 characters")
        if not re.fullmatch(r"[A-Za-z\s\-']+", v):
            raise ValueError("Full name can only contain letters, spaces, hyphens, apostrophes")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v:
            digits = re.sub(r"[\s\-\+]", "", v)
            if not re.fullmatch(r"[6-9][0-9]{9}", digits):
                raise ValueError("Enter a valid 10-digit Indian mobile number starting with 6-9")
        return v


class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone:     Optional[str] = None

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = v.strip()
            if len(v) < 2:
                raise ValueError("Full name must be at least 2 characters")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v:
            digits = re.sub(r"[\s\-\+]", "", v)
            if not re.fullmatch(r"[6-9][0-9]{9}", digits):
                raise ValueError("Enter a valid 10-digit Indian mobile number")
        return v


class UserAdminCreate(UserCreate):
    is_admin: bool = False


class UserAdminUpdate(UserUpdate):
    email:     Optional[EmailStr] = None
    is_admin:  Optional[bool] = None
    password:  Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: Optional[str]) -> Optional[str]:
        if v:
            if len(v) < 8:
                raise ValueError("Password must be at least 8 characters")
            if not re.search(r"[A-Z]", v):
                raise ValueError("Password must contain at least one uppercase letter")
            if not re.search(r"[a-z]", v):
                raise ValueError("Password must contain at least one lowercase letter")
            if not re.search(r"\d", v):
                raise ValueError("Password must contain at least one digit")
            if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
                raise ValueError("Password must contain at least one special character")
        return v


class UserResponse(UserBase):
    id: int
    member_since: datetime
    is_admin: bool
    is_superuser: bool
    addresses: list[AddressResponse] = []

    model_config = ConfigDict(from_attributes=True)


# Short version — used inside OrderResponse to avoid circular nesting
class UserSummary(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    is_superuser: bool = False

    model_config = ConfigDict(from_attributes=True)


# ─────────────────────────────────────────────
# AUTH SCHEMAS (Local JWT flow)
# ─────────────────────────────────────────────
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse