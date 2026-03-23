from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional
import re

# Soft-delete mixin (assuming it's needed here as well, or I'll just import it if I move it to a common place)
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
    label:         Optional[str]  = None
    building_name: Optional[str]  = None
    address_line1: Optional[str]  = None
    address_line2: Optional[str]  = None
    landmark:      Optional[str]  = None
    city:          Optional[str]  = None
    state:         Optional[str]  = None
    pincode:       Optional[str]  = None
    is_default:    Optional[bool] = None

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
