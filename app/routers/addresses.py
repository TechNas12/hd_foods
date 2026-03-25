from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone
from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app import models
from app.schemas.address import (
    AddressCreate, AddressUpdate, AddressResponse,
    AddressWithUserResponse, UserDistanceResponse, AddressDistanceItem,
)
from app.redis_client import cache_set, cache_get, cache_delete, CACHE_KEYS, CACHE_TTL
from app.utils import haversine
import os

router = APIRouter(
    prefix="/addresses",
    tags=["Addresses"],
)

# ─────────────────────────────────────────────
# Helper: generate Google Maps URL from coords
# ─────────────────────────────────────────────
def _make_maps_url(lat: float, lng: float) -> str:
    return f"https://www.google.com/maps?q={lat},{lng}"


def _invalidate_distance_cache(user_id: int) -> None:
    """Clear the cached distance calculation for a user."""
    cache_delete(CACHE_KEYS["user_distance"].format(user_id))


# ─────────────────────────────────────────────
# User CRUD
# ─────────────────────────────────────────────
@router.get("/", response_model=list[AddressResponse])
def get_addresses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Address).filter(
        models.Address.user_id == current_user.id,
        models.Address.is_deleted == False
    ).all()


@router.post("/", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
def create_address(
    payload: AddressCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if payload.is_default:
        db.query(models.Address).filter(
            models.Address.user_id == current_user.id
        ).update({"is_default": False})

    first_address = db.query(models.Address).filter(
        models.Address.user_id == current_user.id,
        models.Address.is_deleted == False
    ).first()

    address_data = payload.model_dump()
    address_data["user_id"] = current_user.id

    if not first_address:
        address_data["is_default"] = True

    # Auto-generate maps_url from coordinates
    if address_data.get("lat") is not None and address_data.get("lng") is not None:
        address_data["maps_url"] = _make_maps_url(address_data["lat"], address_data["lng"])

    address = models.Address(**address_data)
    db.add(address)
    db.commit()
    db.refresh(address)

    _invalidate_distance_cache(current_user.id)
    return address


@router.patch("/{address_id}", response_model=AddressResponse)
def update_address(
    address_id: int,
    payload: AddressUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    address = db.query(models.Address).filter(
        models.Address.id == address_id,
        models.Address.user_id == current_user.id,
        models.Address.is_deleted == False
    ).first()

    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    data = payload.model_dump(exclude_unset=True)

    if data.get("is_default"):
        db.query(models.Address).filter(
            models.Address.user_id == current_user.id
        ).update({"is_default": False})

    for field, value in data.items():
        setattr(address, field, value)

    # Re-generate maps_url if coordinates changed
    if address.lat is not None and address.lng is not None:
        address.maps_url = _make_maps_url(address.lat, address.lng)

    db.commit()
    db.refresh(address)

    _invalidate_distance_cache(current_user.id)
    return address


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    address = db.query(models.Address).filter(
        models.Address.id == address_id,
        models.Address.user_id == current_user.id
    ).first()

    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    if address.is_deleted:
        return None # Already deleted, just return 204

    address.is_deleted = True
    address.deleted_at = datetime.now(timezone.utc)

    if address.is_default:
        address.is_default = False
        remaining = db.query(models.Address).filter(
            models.Address.user_id == current_user.id,
            models.Address.is_deleted == False,
            models.Address.id != address_id
        ).first()
        if remaining:
            remaining.is_default = True

    db.commit()

    _invalidate_distance_cache(current_user.id)
    return None


@router.patch("/{address_id}/set-default", response_model=AddressResponse)
def set_default_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    address = db.query(models.Address).filter(
        models.Address.id == address_id,
        models.Address.user_id == current_user.id,
        models.Address.is_deleted == False
    ).first()

    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    db.query(models.Address).filter(
        models.Address.user_id == current_user.id
    ).update({"is_default": False})

    address.is_default = True
    db.commit()
    db.refresh(address)
    return address


# ─────────────────────────────────────────────
# Admin Endpoints
# ─────────────────────────────────────────────
@router.get("/admin/user/{user_id}", response_model=list[AddressResponse])
def admin_get_user_addresses(
    user_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """Get all addresses for a specific user (admin only)."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return db.query(models.Address).filter(
        models.Address.user_id == user_id,
        models.Address.is_deleted == False
    ).all()


@router.get("/admin/all", response_model=list[AddressWithUserResponse])
def admin_get_all_addresses(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """List all user addresses with user info (admin only, paginated)."""
    addresses = (
        db.query(models.Address)
        .options(joinedload(models.Address.user))
        .filter(models.Address.is_deleted == False)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return addresses


@router.get("/admin/distances", response_model=list[UserDistanceResponse])
def admin_get_distances(
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """
    For each user, compute the straight-line (Haversine) distance from
    the admin warehouse to each of their saved addresses.
    Results are cached in Redis with a 1-hour TTL per user.
    """
    warehouse_lat = float(os.getenv("ADMIN_LAT", "0"))
    warehouse_lng = float(os.getenv("ADMIN_LNG", "0"))

    # Get all users who have non-deleted addresses with coordinates
    users = (
        db.query(models.User)
        .join(models.Address)
        .filter(
            models.Address.is_deleted == False,
            models.Address.lat.isnot(None),
            models.Address.lng.isnot(None),
        )
        .distinct()
        .all()
    )

    results: list[UserDistanceResponse] = []

    for user in users:
        cache_key = CACHE_KEYS["user_distance"].format(user.id)
        cached = cache_get(cache_key)

        if cached:
            results.append(UserDistanceResponse(**cached))
            continue

        # Compute distances
        addresses = (
            db.query(models.Address)
            .filter(
                models.Address.user_id == user.id,
                models.Address.is_deleted == False,
            )
            .all()
        )

        addr_items = []
        distances = []

        for addr in addresses:
            dist = None
            if addr.lat is not None and addr.lng is not None:
                dist = haversine(warehouse_lat, warehouse_lng, addr.lat, addr.lng)
                distances.append(dist)

            addr_items.append(AddressDistanceItem(
                id=addr.id,
                label=addr.label,
                address_line1=addr.address_line1,
                city=addr.city,
                pincode=addr.pincode,
                lat=addr.lat,
                lng=addr.lng,
                maps_url=addr.maps_url,
                distance_km=dist,
            ))

        avg_dist = round(sum(distances) / len(distances), 2) if distances else None

        user_dist = UserDistanceResponse(
            user_id=user.id,
            full_name=user.full_name,
            email=user.email,
            addresses=addr_items,
            avg_distance_km=avg_dist,
        )

        # Cache the result
        cache_set(
            cache_key,
            user_dist.model_dump(),
            CACHE_TTL["user_distance"]
        )

        results.append(user_dist)

    return results
