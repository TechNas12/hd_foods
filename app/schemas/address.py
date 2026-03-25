from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional
import re


class SoftDeleteMixin(BaseModel):
    is_deleted: bool = False
    deleted_at: Optional[datetime] = None


class AddressBase(BaseModel):
    label:         str
    building_name: Optional[str] = None
    address_line1: str
    address_line2: Optional[str] = None
    landmark:      Optional[str] = None
    city:          str
    state:         str
    pincode:       str
    is_default:    bool = False
    lat:           Optional[float] = None
    lng:           Optional[float] = None
    maps_url:      Optional[str] = None

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

    @field_validator("lat")
    @classmethod
    def validate_lat(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and (v < -90 or v > 90):
            raise ValueError("Latitude must be between -90 and 90")
        return v

    @field_validator("lng")
    @classmethod
    def validate_lng(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and (v < -180 or v > 180):
            raise ValueError("Longitude must be between -180 and 180")
        return v


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    label:         Optional[str]   = None
    building_name: Optional[str]   = None
    address_line1: Optional[str]   = None
    address_line2: Optional[str]   = None
    landmark:      Optional[str]   = None
    city:          Optional[str]   = None
    state:         Optional[str]   = None
    pincode:       Optional[str]   = None
    is_default:    Optional[bool]  = None
    lat:           Optional[float] = None
    lng:           Optional[float] = None
    maps_url:      Optional[str]   = None

    @field_validator("pincode")
    @classmethod
    def validate_pincode(cls, v: Optional[str]) -> Optional[str]:
        if v and not re.fullmatch(r"[1-9][0-9]{5}", v):
            raise ValueError("Pincode must be a valid 6-digit Indian pincode")
        return v

    @field_validator("lat")
    @classmethod
    def validate_lat(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and (v < -90 or v > 90):
            raise ValueError("Latitude must be between -90 and 90")
        return v

    @field_validator("lng")
    @classmethod
    def validate_lng(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and (v < -180 or v > 180):
            raise ValueError("Longitude must be between -180 and 180")
        return v


class AddressResponse(AddressBase, SoftDeleteMixin):
    id:      int
    user_id: int

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────
# Admin-specific response schemas
# ─────────────────────────────────────────────
class UserBasicInfo(BaseModel):
    id:        int
    full_name: str
    email:     str

    model_config = {"from_attributes": True}


class AddressWithUserResponse(AddressResponse):
    """Address with embedded user info for admin views."""
    user: Optional[UserBasicInfo] = None


class AddressDistanceItem(BaseModel):
    """Single address with its distance from warehouse."""
    id:           int
    label:        str
    address_line1: str
    city:         Optional[str] = None
    pincode:      Optional[str] = None
    lat:          Optional[float] = None
    lng:          Optional[float] = None
    maps_url:     Optional[str] = None
    distance_km:  Optional[float] = None


class UserDistanceResponse(BaseModel):
    """Per-user distance summary."""
    user_id:      int
    full_name:    str
    email:        str
    addresses:    list[AddressDistanceItem]
    avg_distance_km: Optional[float] = None
