from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_active_user, require_admin
from app import models
from app.schemas.user import (
    UserRegisterPayload, UserResponse, UserUpdate,
    AddressCreate, AddressUpdate, AddressResponse
)

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


# ── Public ──────────────────────────────────

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegisterPayload, db: Session = Depends(get_db)):
    """
    Called by frontend AFTER Supabase signup succeeds.
    Creates the matching user row in our local DB.
    """
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        full_name     = payload.full_name,
        email         = payload.email,
        phone         = payload.phone,
        password_hash = "",   # Auth handled by Supabase
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ── Protected ────────────────────────────────

@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: models.User = Depends(get_current_active_user)):
    """Returns the logged-in user's profile"""
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_my_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    if payload.full_name: current_user.full_name = payload.full_name
    if payload.phone:     current_user.phone     = payload.phone
    db.commit()
    db.refresh(current_user)
    return current_user


# ── Addresses ────────────────────────────────

@router.get("/me/addresses", response_model=list[AddressResponse])
def get_my_addresses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    return db.query(models.Address).filter(
        models.Address.user_id   == current_user.id,
        models.Address.is_deleted == False
    ).all()


@router.post("/me/addresses", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
def add_address(
    payload: AddressCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    # If new address is default, unset all others
    if payload.is_default:
        db.query(models.Address).filter(
            models.Address.user_id == current_user.id
        ).update({"is_default": False})

    address = models.Address(**payload.model_dump(), user_id=current_user.id)
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


@router.patch("/me/addresses/{address_id}", response_model=AddressResponse)
def update_address(
    address_id: int,
    payload: AddressUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    address = db.query(models.Address).filter(
        models.Address.id      == address_id,
        models.Address.user_id == current_user.id,
        models.Address.is_deleted == False,
    ).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(address, field, value)

    db.commit()
    db.refresh(address)
    return address


@router.delete("/me/addresses/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    address = db.query(models.Address).filter(
        models.Address.id      == address_id,
        models.Address.user_id == current_user.id,
    ).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    # Soft delete
    from datetime import datetime, timezone
    address.is_deleted = True
    address.deleted_at = datetime.now(timezone.utc)
    db.commit()