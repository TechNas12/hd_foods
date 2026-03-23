from pydantic import BaseModel, field_validator, model_validator
from decimal import Decimal
from datetime import datetime
from typing import Optional
import re
from app.schemas.category import CategoryResponse
from app.schemas.common import SoftDeleteMixin


# ─────────────────────────────────────────────
# PRODUCT IMAGE SCHEMAS
# ─────────────────────────────────────────────
class ProductImageBase(BaseModel):
    image_url:  str
    is_hero: bool = False

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, v: str) -> str:
        v = v.strip()
        if not v.startswith(("http://", "https://")):
            raise ValueError("Image URL must start with http:// or https://")
        # Relaxed check to allow Unsplash URLs which don't have standard extensions
        return v


class ProductImageCreate(ProductImageBase):
    product_id: Optional[int] = None
    storage_path: str
    sort_order: int = 0


class ProductImageUpdate(BaseModel):
    image_url:  Optional[str]  = None
    is_hero: Optional[bool] = None
    sort_order: Optional[int]  = None


class ProductImageResponse(ProductImageBase):
    id:         str
    product_id: int
    storage_path: str
    sort_order: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────
# PRODUCT VARIANT SCHEMAS
# ─────────────────────────────────────────────
class ProductVariantBase(BaseModel):
    name:           str
    price_override: Optional[Decimal] = None   # None = use product base_price
    stock_quantity: int = 0

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Variant name must be at least 2 characters")
        if len(v) > 100:
            raise ValueError("Variant name cannot exceed 100 characters")
        return v

    @field_validator("price_override")
    @classmethod
    def validate_price_override(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None:
            if v <= 0:
                raise ValueError("Price override must be greater than 0")
            if v > Decimal("99999.99"):
                raise ValueError("Price override cannot exceed 99,999.99")
        return v

    @field_validator("stock_quantity")
    @classmethod
    def validate_stock(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Stock quantity cannot be negative")
        return v


class ProductVariantCreate(ProductVariantBase):
    pass


class ProductVariantUpdate(BaseModel):
    name:           Optional[str]     = None
    price_override: Optional[Decimal] = None
    stock_quantity: Optional[int]     = None

    @field_validator("price_override")
    @classmethod
    def validate_price(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and v <= 0:
            raise ValueError("Price override must be greater than 0")
        return v

    @field_validator("stock_quantity")
    @classmethod
    def validate_stock(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 0:
            raise ValueError("Stock quantity cannot be negative")
        return v


class ProductVariantUpdateWithId(ProductVariantUpdate):
    id: Optional[int] = None


class ProductVariantResponse(ProductVariantBase, SoftDeleteMixin):
    id:         int
    product_id: int
    images:     list[ProductImageResponse] = []

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────
# PRODUCT SCHEMAS
# ─────────────────────────────────────────────

# (Removed static VALID_CATEGORIES in favor of dynamic centralized categories)


class ProductBase(BaseModel):
    name:        str
    category_id: Optional[int] = None
    subtitle:    Optional[str] = None
    description: Optional[str] = None
    base_price:  Decimal
    original_price: Optional[Decimal] = None
    is_active:   bool = True
    is_featured: bool = False

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Product name must be at least 2 characters")
        if len(v) > 200:
            raise ValueError("Product name cannot exceed 200 characters")
        return v

    # (Removed static category validator)

    @field_validator("base_price")
    @classmethod
    def validate_base_price(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Base price must be greater than 0")
        if v > Decimal("99999.99"):
            raise ValueError("Base price cannot exceed 99,999.99")
        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = v.strip()
            if len(v) < 10:
                raise ValueError("Description must be at least 10 characters")
            if len(v) > 2000:
                raise ValueError("Description cannot exceed 2000 characters")
        return v


class ProductCreate(ProductBase):
    slug:     Optional[str] = None    # Auto-generated if not provided
    variants: list[ProductVariantCreate] = []
    images:   list[ProductImageCreate]   = []

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = v.strip().lower()
            if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", v):
                raise ValueError(
                    "Slug must be lowercase letters, numbers, and hyphens only "
                    "(e.g. 'methi-thepla-250g')"
                )
        return v

    @model_validator(mode="after")
    def auto_generate_slug(self) -> "ProductCreate":
        """Auto-generate slug from name if not provided"""
        if not self.slug and self.name:
            self.slug = re.sub(r"[^a-z0-9]+", "-", self.name.lower().strip()).strip("-")
        return self


class ProductUpdate(BaseModel):
    name:        Optional[str]     = None
    category_id: Optional[int]     = None
    subtitle:    Optional[str]     = None
    description: Optional[str]    = None
    base_price:  Optional[Decimal] = None
    original_price: Optional[Decimal] = None
    is_active:   Optional[bool]   = None
    is_featured: Optional[bool]   = None
    variants:    Optional[list[ProductVariantUpdateWithId]] = None

    # (Removed static category validator)

    @field_validator("base_price")
    @classmethod
    def validate_price(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None:
            if v <= 0:
                raise ValueError("Base price must be greater than 0")
        return v


class ProductResponse(ProductBase, SoftDeleteMixin):
    id:            int
    slug:          str
    category_rel:  Optional["CategoryResponse"] = None
    rating:        float
    reviews_count: int
    variants:      list[ProductVariantResponse] = []
    images:        list[ProductImageResponse]   = []

    model_config = {"from_attributes": True}


# Lightweight version — used in order items, search results
class ProductSummary(BaseModel):
    id:         int
    name:       str
    slug:       str
    category_id: Optional[int] = None
    category_rel: Optional[CategoryResponse] = None
    subtitle:   Optional[str] = None
    base_price: Decimal
    original_price: Optional[Decimal] = None
    is_active: bool = True
    variants: list[ProductVariantResponse] = []
    rating:     float
    images: list[ProductImageResponse] = [] # Simply representing ProductImage records

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────
# CATEGORY LIST (for frontend dropdowns)
# ─────────────────────────────────────────────
# (Removed CategoryListResponse as Categories are now dynamic via API)