from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.dependencies import require_admin
from app import models
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductResponse,
    ProductSummary, ProductVariantCreate,
    ProductImageCreate, ProductImageUpdate,
    ProductImageResponse,
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
    category_id:   Optional[int] = Query(None),
    category_slug: Optional[str] = Query(None),
    is_featured:   Optional[bool] = Query(None),
    search:   str | None = Query(None),
    skip:  int = Query(0,  ge=0),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
):
    # Only cache the default unfiltered first page
    # Filtered/paginated queries skip cache — too many combinations
    is_cacheable = not category_id and not category_slug and is_featured is None and not search and skip == 0 and limit == 20

    if is_cacheable:
        cached = cache_get(CACHE_KEYS["products_list"])
        if cached:
            print("[Redis] HIT — products:list")
            return cached

    query = db.query(models.Product).options(
        joinedload(models.Product.variants),
        joinedload(models.Product.images),
        joinedload(models.Product.category_rel)
    ).filter(
        models.Product.is_active  == True,
        models.Product.is_deleted == False,
    )
    
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    elif category_slug:
        query = query.join(models.Product.category_rel).filter(models.Category.slug == category_slug)
        
    if is_featured is not None:
        query = query.filter(models.Product.is_featured == is_featured)

    if search:   
        query = query.filter(models.Product.name.ilike(f"%{search}%"))

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

    product = db.query(models.Product).options(
        joinedload(models.Product.variants),
        joinedload(models.Product.images),
        joinedload(models.Product.category_rel)
    ).filter(
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


@router.get("/id/{product_id}", response_model=ProductResponse)
def get_product_by_id(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).options(
        joinedload(models.Product.variants),
        joinedload(models.Product.images),
        joinedload(models.Product.category_rel)
    ).filter(
        models.Product.id         == product_id,
        models.Product.is_deleted == False,
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

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
        db.add(models.ProductVariant(**v.model_dump(exclude={"product_id"}), product_id=product.id))
    for i in payload.images:
        db.add(models.ProductImage(**i.model_dump(exclude={"product_id"}), product_id=product.id))

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

    data = payload.model_dump(exclude_none=True)
    variants_data = data.pop("variants", None)

    # Update basic product fields
    for field, value in data.items():
        setattr(product, field, value)

    # Synchronize variants if provided
    if variants_data is not None:
        existing_variants = {v.id: v for v in product.variants}
        new_variant_ids = []

        for v_item in variants_data:
            v_id = v_item.get("id")
            if v_id and v_id in existing_variants:
                # Update existing variant
                variant = existing_variants[v_id]
                for k, v in v_item.items():
                    if k != "id":
                        setattr(variant, k, v)
                new_variant_ids.append(v_id)
            else:
                # Create new variant
                new_variant = models.ProductVariant(**v_item, product_id=product.id)
                db.add(new_variant)
                db.flush() # To get the new ID
                new_variant_ids.append(new_variant.id)

        # Remove variants that weren't in the new list
        for v_id, variant in existing_variants.items():
            if v_id not in new_variant_ids:
                db.delete(variant)

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


@router.post("/{product_id}/images", response_model=ProductImageResponse)
def add_product_image(
    product_id: int,
    payload: ProductImageCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    import uuid
    img_data = payload.model_dump()
    img_data["product_id"] = product_id
    if "id" not in img_data or not img_data["id"]:
        img_data["id"] = str(uuid.uuid4())
        
    image = models.ProductImage(**img_data)
    db.add(image)
    
    # if is_hero, unset others
    if image.is_hero:
        db.query(models.ProductImage).filter(
            models.ProductImage.product_id == product_id,
        ).update({"is_hero": False})
        image.is_hero = True  # ensuring our new image is true
        
    db.commit()
    db.refresh(image)
    invalidate_product_cache(slug=product.slug)
    return image


@router.delete("/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product_image(
    image_id: str,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    image = db.query(models.ProductImage).filter(models.ProductImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
        
    product_id = image.product_id
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    
    db.delete(image)
    
    # if it was hero, make another image hero
    if image.is_hero:
        next_hero = db.query(models.ProductImage).filter(models.ProductImage.product_id == product_id).first()
        if next_hero:
            next_hero.is_hero = True
            
    db.commit()
    if product:
        invalidate_product_cache(slug=product.slug)


@router.patch("/images/{image_id}", response_model=ProductImageResponse)
def update_product_image(
    image_id: str,
    payload: ProductImageUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    image = db.query(models.ProductImage).filter(models.ProductImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
        
    product = db.query(models.Product).filter(models.Product.id == image.product_id).first()

    # We reuse dict iteration to avoid needing a specific schema for now
    update_data = payload.model_dump(exclude_unset=True)
    if "is_hero" in update_data:
        image.is_hero = update_data["is_hero"]
        if image.is_hero:
            db.query(models.ProductImage).filter(
                models.ProductImage.product_id == image.product_id,
                models.ProductImage.id != image.id
            ).update({"is_hero": False})
            
    if "sort_order" in update_data:
        image.sort_order = update_data["sort_order"]
        
    db.commit()
    db.refresh(image)
    if product:
        invalidate_product_cache(slug=product.slug)
    return image