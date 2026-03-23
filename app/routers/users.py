from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import (
    get_current_active_user, require_admin,
    get_password_hash, verify_password, create_access_token
)
from app import models
from app.schemas.user import (
    UserCreate, UserLogin, Token, UserResponse, UserUpdate,
    UserAdminCreate, UserAdminUpdate,
    AddressCreate, AddressUpdate, AddressResponse
)

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


# ── Public ──────────────────────────────────

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    """
    Creates a new user with hashed password and returns a JWT token.
    """
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        full_name     = payload.full_name,
        email         = payload.email,
        phone         = payload.phone,
        password_hash = get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=Token)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates user and returns a JWT token.
    """
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user}


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
    """Update own profile. Superusers cannot be modified via API."""
    if current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superuser accounts cannot be modified via the web interface. Please use SQL."
        )

    update_data = payload.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

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


# ── Admin User Management ───────────────────

@router.get("/", response_model=list[UserResponse])
def admin_list_users(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """(Admin) List all non-deleted users"""
    return db.query(models.User).filter(models.User.is_deleted == False).order_by(models.User.member_since.desc()).all()


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def admin_create_user(
    payload: UserAdminCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """(Admin) Create a new user with specified role"""
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        full_name     = payload.full_name,
        email         = payload.email,
        phone         = payload.phone,
        password_hash = get_password_hash(payload.password),
        is_admin      = payload.is_admin
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserResponse)
def admin_get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """(Admin) Get details for a specific user"""
    user = db.query(models.User).filter(models.User.id == user_id, models.User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserResponse)
def admin_update_user(
    user_id: int,
    payload: UserAdminUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """(Admin) Update user profile, email, or role. Superusers are immutable via API."""
    user = db.query(models.User).filter(models.User.id == user_id, models.User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superuser accounts are immutable via the web interface. Please use SQL."
        )

    update_data = payload.model_dump(exclude_none=True)
    
    if "password" in update_data:
        password = update_data.pop("password")
        user.password_hash = get_password_hash(password)

    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """(Admin) Soft-delete a user. Superusers cannot be deleted via API."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superuser accounts cannot be deleted via the web interface. Please use SQL."
        )

    from datetime import datetime, timezone
    user.is_deleted = True
    user.deleted_at = datetime.now(timezone.utc)
    db.commit()