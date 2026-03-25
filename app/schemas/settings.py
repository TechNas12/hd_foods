from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional
from decimal import Decimal

class StoreSettingsBase(BaseModel):
    warehouse_address: Optional[str] = None
    warehouse_lat: Optional[float] = None
    warehouse_lng: Optional[float] = None
    free_delivery_km: float = 3.0
    tier1_delivery_km: float = 6.0
    tier1_delivery_fee: Decimal = Decimal('80.00')

    @field_validator("warehouse_lat")
    @classmethod
    def validate_lat(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and (v < -90 or v > 90):
            raise ValueError("Latitude must be between -90 and 90")
        return v

    @field_validator("warehouse_lng")
    @classmethod
    def validate_lng(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and (v < -180 or v > 180):
            raise ValueError("Longitude must be between -180 and 180")
        return v

class StoreSettingsUpdate(StoreSettingsBase):
    pass

class StoreSettingsResponse(StoreSettingsBase):
    id: int
    updated_at: datetime

    model_config = {"from_attributes": True}
