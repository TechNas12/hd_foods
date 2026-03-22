from pydantic import BaseModel, EmailStr, field_validator, model_validator
from datetime import datetime
from typing import Optional
import re


# ─────────────────────────────────────────────
# Shared soft-delete mixin for all responses
# ─────────────────────────────────────────────
class SoftDeleteMixin(BaseModel):
    is_deleted: bool = False
    deleted_at: Optional[datetime] = None


# ─────────────────────────────────────────────
# ADDRESS SCHEMAS
# ─────────────────────────────────────────────
class AddressBase(BaseModel):
    label:      str
    street:     str
    city:       str
    state:      str
    pincode:    str
    is_default: bool = False

    @field_validator("pincode")
    @classmethod
    def validate_pincode(cls, v: str) -> str:
        if not re.fullmatch(r"[1-9][0-9]{5}", v):
            raise ValueError("Pincode must be a valid 6-digit Indian pincode")
        return v

    @field_validator("label")
    @classmethod
    def validate_label(cls, v: str) -> str:
        if len(v.strip()) < 2:
            raise ValueError("Label must be at least 2 characters")
        return v.strip().title()


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    label:      Optional[str]  = None
    street:     Optional[str]  = None
    city:       Optional[str]  = None
    state:      Optional[str]  = None
    pincode:    Optional[str]  = None
    is_default: Optional[bool] = None

    @field_validator("pincode")
    @classmethod
    def validate_pincode(cls, v: Optional[str]) -> Optional[str]:
        if v and not re.fullmatch(r"[1-9][0-9]{5}", v):
            raise ValueError("Pincode must be a valid 6-digit Indian pincode")
        return v


class AddressResponse(AddressBase, SoftDeleteMixin):
    id:      int
    user_id: int

    model_config = {"from_attributes": True}


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


class UserResponse(UserBase, SoftDeleteMixin):
    id:           int
    member_since: datetime
    addresses:    list[AddressResponse] = []

    model_config = {"from_attributes": True}


# Short version — used inside OrderResponse to avoid circular nesting
class UserSummary(BaseModel):
    id:        int
    full_name: str
    email:     EmailStr

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────
# AUTH SCHEMAS (Supabase flow)
# ─────────────────────────────────────────────
class UserRegisterPayload(BaseModel):
    """
    Sent by frontend AFTER Supabase signup succeeds.
    Creates the matching row in our local DB.
    """
    full_name: str
    email:     EmailStr
    phone:     Optional[str] = None


class TokenData(BaseModel):
    """Extracted from Supabase JWT payload"""
    email:   Optional[str] = None
    user_id: Optional[str] = None  # Supabase UUID (sub field)