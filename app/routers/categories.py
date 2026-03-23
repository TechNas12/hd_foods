from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import require_admin
from app import models
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse

router = APIRouter(
    prefix="/categories",
    tags=["Categories"],
)

@router.get("/", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()

@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    existing = db.query(models.Category).filter(
        (models.Category.slug == payload.slug) | (models.Category.name == payload.name)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name or slug already exists")
    
    category = models.Category(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.patch("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(category, field, value)
        
    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    db.delete(category)
    db.commit()
