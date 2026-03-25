from pydantic import BaseModel, field_validator, model_validator
from decimal import Decimal
from datetime import datetime
from typing import Optional
from app.schemas.product import ProductSummary, ProductVariantResponse
from app.schemas.user import UserSummary, AddressResponse


# ─────────────────────────────────────────────
# ENUMS AS CONSTANTS
# (Using sets instead of Enum for easy extension)
# ─────────────────────────────────────────────
VALID_ORDER_STATUSES = {"Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"}
VALID_PAYMENT_METHODS = {"UPI", "COD",}
VALID_PAYMENT_STATUSES = {"Pending", "Paid", "Failed", "Refunded"}


# ─────────────────────────────────────────────
# ORDER ITEM SCHEMAS
# ─────────────────────────────────────────────
class OrderItemBase(BaseModel):
    product_id: Optional[int] = None
    variant_id: Optional[int] = None
    quantity:   int
    unit_price: Decimal

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Quantity must be at least 1")
        if v > 100:
            raise ValueError("Cannot order more than 100 units of a single item")
        return v

    @field_validator("unit_price")
    @classmethod
    def validate_unit_price(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Unit price must be greater than 0")
        if v > Decimal("99999.99"):
            raise ValueError("Unit price cannot exceed 99,999.99")
        return v


class OrderItemCreate(BaseModel):
    """
    Frontend only sends product_id, variant_id, quantity.
    unit_price is resolved server-side from the product/variant — 
    never trust the client for pricing.
    """
    product_id: Optional[int] = None
    variant_id: Optional[int] = None
    quantity:   int

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Quantity must be at least 1")
        if v > 100:
            raise ValueError("Cannot order more than 100 units of a single item")
        return v


class OrderItemUpdate(BaseModel):
    quantity: Optional[int] = None

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v: Optional[int]) -> Optional[int]:
        if v is not None:
            if v <= 0:
                raise ValueError("Quantity must be at least 1")
            if v > 100:
                raise ValueError("Cannot order more than 100 units of a single item")
        return v


class OrderItemResponse(OrderItemBase):
    id:         int
    order_id:   int
    product:    Optional[ProductSummary] = None
    variant:    Optional[ProductVariantResponse] = None
    is_deleted: bool = False
    deleted_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────
# ORDER SCHEMAS
# ─────────────────────────────────────────────
class OrderBase(BaseModel):
    payment_method: str

    @field_validator("payment_method")
    @classmethod
    def validate_payment_method(cls, v: str) -> str:
        v = v.strip()
        if v not in VALID_PAYMENT_METHODS:
            raise ValueError(
                f"Invalid payment method. Must be one of: "
                f"{', '.join(sorted(VALID_PAYMENT_METHODS))}"
            )
        return v


class OrderCreate(OrderBase):
    """
    What the frontend sends when placing an order.
    Totals are calculated server-side — never trust the client.
    """
    address_id: int
    items:      list[OrderItemCreate]

    @field_validator("items")
    @classmethod
    def validate_items(cls, v: list) -> list:
        if not v:
            raise ValueError("Order must contain at least one item")
        if len(v) > 50:
            raise ValueError("Cannot have more than 50 different items in one order")

        # Check for duplicate product+variant combinations
        seen = set()
        for item in v:
            key = (item.product_id, item.variant_id)
            if key in seen:
                raise ValueError(
                    f"Duplicate item found for product_id={item.product_id}. "
                    f"Combine quantities instead."
                )
            seen.add(key)
        return v


class OrderStatusUpdate(BaseModel):
    """Used by admin to update order tracking status"""
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in VALID_ORDER_STATUSES:
            raise ValueError(
                f"Invalid status. Must be one of: "
                f"{', '.join(sorted(VALID_ORDER_STATUSES))}"
            )
        return v


class OrderPaymentUpdate(BaseModel):
    """Used to update payment status after UPI/payment gateway callback"""
    payment_status: str

    @field_validator("payment_status")
    @classmethod
    def validate_payment_status(cls, v: str) -> str:
        if v not in VALID_PAYMENT_STATUSES:
            raise ValueError(
                f"Invalid payment status. Must be one of: "
                f"{', '.join(sorted(VALID_PAYMENT_STATUSES))}"
            )
        return v


class OrderResponse(OrderBase):
    id:             int
    user_id:        Optional[int] = None
    address_id:     Optional[int] = None
    status:         str
    subtotal:       Decimal
    shipping_fee:   Decimal
    total_amount:   Decimal
    payment_status: str
    created_at:     datetime
    updated_at:     Optional[datetime] = None
    items:          list[OrderItemResponse] = []
    user:           Optional[UserSummary]   = None
    address:        Optional[AddressResponse] = None
    distance_km:    Optional[float] = None
    is_deleted:     bool = False
    deleted_at:     Optional[datetime] = None

    model_config = {"from_attributes": True}


# Lightweight version — for listing orders (no nested items)
class OrderSummary(BaseModel):
    id:             int
    status:         str
    total_amount:   Decimal
    payment_method: str
    payment_status: str
    created_at:     datetime
    item_count:     Optional[int] = None   # computed in route

    model_config = {"from_attributes": True}

