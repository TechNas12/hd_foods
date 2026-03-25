from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.database import get_db
from app.dependencies import require_admin
from app import models
from app.schemas.settings import StoreSettingsUpdate, StoreSettingsResponse
import os

router = APIRouter(
    prefix="/settings",
    tags=["Settings"],
)

def get_or_create_settings(db: Session) -> models.StoreSettings:
    settings = db.query(models.StoreSettings).first()
    if not settings:
        # Fallback to existing env vars if first time
        lat = float(os.getenv("ADMIN_LAT", "19.9975"))
        lng = float(os.getenv("ADMIN_LNG", "73.7898"))
        settings = models.StoreSettings(
            warehouse_lat=lat,
            warehouse_lng=lng,
            warehouse_address="Saved from .env defaults"
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.get("/public", response_model=StoreSettingsResponse)
def get_public_settings(db: Session = Depends(get_db)):
    """Public endpoint to get warehouse coordinates and shipping rules for checkout."""
    return get_or_create_settings(db)

@router.get("/admin", response_model=StoreSettingsResponse)
def get_admin_settings(
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """Admin endpoint to view settings."""
    return get_or_create_settings(db)

@router.put("/admin", response_model=StoreSettingsResponse)
def update_admin_settings(
    payload: StoreSettingsUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """Admin endpoint to update settings."""
    settings = get_or_create_settings(db)
    
    for field, value in payload.model_dump().items():
        setattr(settings, field, value)
        
    settings.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(settings)
    
    # Invalidate Redis distances cache completely as warehouse moved
    from app.redis_client import redis, CACHE_KEYS
    if redis:
        try:
            # Clear all distance caches (they start with dist:)
            for key in redis.keys("dist:*"):
                redis.delete(key)
        except Exception:
            pass
            
    return settings
