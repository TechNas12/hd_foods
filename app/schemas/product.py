from pydantic import BaseModel, field_validator, model_validator
from decimal import Decimal
from datetime import datetime
from typing import Optional
import re


# ─────────────────────────────────────────────
# PRODUCT IMAGE SCHEMAS
# ─────────────────────────────────────────────
class ProductImageBase(BaseModel):
    image_url:  str
    is_primary: bool = False

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, v: str) -> str:
        v = v.strip()
        if not v.startswith(("http://", "https://")):
            raise ValueError("Image URL must start with http:// or https://")
        allowed_extensions = (".jpg", ".jpeg", ".png", ".webp", ".avif")
        if not any(v.lower().split("?")[0].endswith(ext) for ext in allowed_extensions):
            raise ValueError("Image must be jpg, jpeg, png, webp, or avif")
        return v


class ProductImageCreate(ProductImageBase):
    variant_id: Optional[int] = None   # None = belongs to base product


class ProductImageUpdate(BaseModel):
    image_url:  Optional[str]  = None
    is_primary: Optional[bool] = None
    variant_id: Optional[int]  = None


class ProductImageResponse(ProductImageBase):
    id:         int
    product_id: int
    variant_id: Optional[int] = None
    is_deleted: bool = False
    deleted_at: Optional[datetime] = None

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


class ProductVariantResponse(ProductVariantBase):
    id:         int
    product_id: int
    images:     list[ProductImageResponse] = []
    is_deleted: bool = False
    deleted_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────
# PRODUCT SCHEMAS
# ─────────────────────────────────────────────

# Valid categories for HD Masale
VALID_CATEGORIES = {
    "thepla",
    "masala",
    "snacks",
    "pickles",
    "sweets",
    "beverages",
    "dry-fruits",
    "combo",
    "other",
}


class ProductBase(BaseModel):
    name:        str
    category:    str
    description: Optional[str] = None
    base_price:  Decimal
    is_active:   bool = True

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Product name must be at least 2 characters")
        if len(v) > 200:
            raise ValueError("Product name cannot exceed 200 characters")
        return v

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        v = v.strip().lower()
        if v not in VALID_CATEGORIES:
            raise ValueError(
                f"Invalid category. Must be one of: {', '.join(sorted(VALID_CATEGORIES))}"
            )
        return v

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
    category:    Optional[str]     = None
    description: Optional[str]    = None
    base_price:  Optional[Decimal] = None
    is_active:   Optional[bool]   = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = v.strip().lower()
            if v not in VALID_CATEGORIES:
                raise ValueError(
                    f"Invalid category. Must be one of: {', '.join(sorted(VALID_CATEGORIES))}"
                )
        return v

    @field_validator("base_price")
    @classmethod
    def validate_price(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None:
            if v <= 0:
                raise ValueError("Base price must be greater than 0")
        return v


class ProductResponse(ProductBase):
    id:            int
    slug:          str
    rating:        float
    reviews_count: int
    variants:      list[ProductVariantResponse] = []
    images:        list[ProductImageResponse]   = []
    is_deleted:    bool = False
    deleted_at:    Optional[datetime] = None

    model_config = {"from_attributes": True}


# Lightweight version — used in order items, search results
class ProductSummary(BaseModel):
    id:         int
    name:       str
    slug:       str
    base_price: Decimal
    rating:     float
    images:     list[ProductImageResponse] = []

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────
# CATEGORY LIST (for frontend dropdowns)
# ─────────────────────────────────────────────
class CategoryListResponse(BaseModel):
    categories: list[str] = sorted(VALID_CATEGORIES)