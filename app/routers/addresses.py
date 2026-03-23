from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.database import get_db
from app.dependencies import get_current_user
from app import models
from app.schemas.address import AddressCreate, AddressUpdate, AddressResponse

router = APIRouter(
    prefix="/addresses",
    tags=["Addresses"],
)

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
    # If this is the first address, or is_default is true, handle default logic
    if payload.is_default:
        db.query(models.Address).filter(
            models.Address.user_id == current_user.id
        ).update({"is_default": False})

    # Check if this is the user's first non-deleted address
    first_address = db.query(models.Address).filter(
        models.Address.user_id == current_user.id,
        models.Address.is_deleted == False
    ).first()
    
    address_data = payload.model_dump()
    address_data["user_id"] = current_user.id
    if not first_address:
        address_data["is_default"] = True

    address = models.Address(**address_data)
    db.add(address)
    db.commit()
    db.refresh(address)
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

    db.commit()
    db.refresh(address)
    return address

@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(
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

    address.is_deleted = True
    address.deleted_at = datetime.now(timezone.utc)
    
    # If we deleted the default address, try to assign a new one
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
