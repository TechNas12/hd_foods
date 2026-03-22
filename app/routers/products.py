from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import require_admin
from app import models
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductResponse,
    ProductSummary, ProductVariantCreate,
    ProductImageCreate,
)
from app.redis_client import (
    cache_get, cache_set, invalidate_product_cache,
    CACHE_KEYS, CACHE_TTL,
)

router = APIRouter(
    prefix="/products",
    tags=["Products"],
)


# ── Public ──────────────────────────────────

@router.get("/", response_model=list[ProductSummary])
def list_products(
    category: str | None = Query(None),
    search:   str | None = Query(None),
    skip:  int = Query(0,  ge=0),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
):
    # Only cache the default unfiltered first page
    # Filtered/paginated queries skip cache — too many combinations
    is_cacheable = not category and not search and skip == 0 and limit == 20

    if is_cacheable:
        cached = cache_get(CACHE_KEYS["products_list"])
        if cached:
            print("[Redis] HIT — products:list")
            return cached

    query = db.query(models.Product).filter(
        models.Product.is_active  == True,
        models.Product.is_deleted == False,
    )
    if category: query = query.filter(models.Product.category == category.lower())
    if search:   query = query.filter(models.Product.name.ilike(f"%{search}%"))

    products = query.offset(skip).limit(limit).all()

    # Serialize via Pydantic then store
    if is_cacheable:
        serialized = [ProductSummary.model_validate(p).model_dump() for p in products]
        cache_set(CACHE_KEYS["products_list"], serialized, CACHE_TTL["products_list"])
        print("[Redis] MISS — products:list cached")

    return products


@router.get("/{slug}", response_model=ProductResponse)
def get_product(slug: str, db: Session = Depends(get_db)):
    cache_key = CACHE_KEYS["product_slug"].format(slug)
    cached = cache_get(cache_key)

    if cached:
        print(f"[Redis] HIT — {cache_key}")
        return cached

    product = db.query(models.Product).filter(
        models.Product.slug       == slug,
        models.Product.is_deleted == False,
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Serialize via Pydantic then store
    serialized = ProductResponse.model_validate(product).model_dump()
    cache_set(cache_key, serialized, CACHE_TTL["product_slug"])
    print(f"[Redis] MISS — {cache_key} cached")

    return product


# ── Admin only ───────────────────────────────

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    existing = db.query(models.Product).filter(
        models.Product.slug == payload.slug
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product with this slug already exists")

    product_data = payload.model_dump(exclude={"variants", "images"})
    product = models.Product(**product_data)
    db.add(product)
    db.flush()

    for v in payload.variants:
        db.add(models.ProductVariant(**v.model_dump(), product_id=product.id))
    for i in payload.images:
        db.add(models.ProductImage(**i.model_dump(), product_id=product.id))

    db.commit()
    db.refresh(product)

    # Invalidate list cache — new product added
    invalidate_product_cache()
    print("[Redis] INVALIDATED — products:list")

    return product


@router.patch("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    product = db.query(models.Product).filter(
        models.Product.id         == product_id,
        models.Product.is_deleted == False,
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    # Invalidate both list and this product's slug cache
    invalidate_product_cache(slug=product.slug)
    print(f"[Redis] INVALIDATED — products:list + products:slug:{product.slug}")

    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    product = db.query(models.Product).filter(
        models.Product.id == product_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    from datetime import datetime, timezone
    product.is_deleted = True
    product.deleted_at = datetime.now(timezone.utc)
    db.commit()

    # Invalidate both caches
    invalidate_product_cache(slug=product.slug)
    print(f"[Redis] INVALIDATED — products:list + products:slug:{product.slug}")