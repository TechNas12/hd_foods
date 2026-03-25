from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.database import get_db
from app.dependencies import get_current_active_user, require_admin
from app import models
from app.utils import haversine
import os
from app.schemas.order import (
    OrderCreate, OrderResponse, OrderSummary,
    OrderStatusUpdate, OrderPaymentUpdate,
)

router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
)


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    # Verify address belongs to user
    address = db.query(models.Address).filter(
        models.Address.id         == payload.address_id,
        models.Address.user_id    == current_user.id,
        models.Address.is_deleted == False,
    ).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    # Resolve prices server-side — never trust client pricing
    subtotal    = 0
    order_items = []

    for item in payload.items:
        product = db.query(models.Product).filter(
            models.Product.id         == item.product_id,
            models.Product.is_active  == True,
            models.Product.is_deleted == False,
        ).first()
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item.product_id} not found"
            )

        unit_price = product.base_price

        if item.variant_id:
            variant = db.query(models.ProductVariant).filter(
                models.ProductVariant.id         == item.variant_id,
                models.ProductVariant.product_id == item.product_id,
                models.ProductVariant.is_deleted == False,
            ).first()
            if not variant:
                raise HTTPException(
                    status_code=404,
                    detail=f"Variant {item.variant_id} not found"
                )
            if variant.stock_quantity < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for {product.name} — {variant.name}"
                )
            if variant.price_override:
                unit_price = variant.price_override

            # Deduct stock
            variant.stock_quantity -= item.quantity

        subtotal += unit_price * item.quantity
        order_items.append(models.OrderItem(
            product_id = item.product_id,
            variant_id = item.variant_id,
            quantity   = item.quantity,
            unit_price = unit_price,
        ))

    # Fetch store settings for distance-based shipping
    from app.routers.settings import get_or_create_settings
    settings = get_or_create_settings(db)
    
    # Calculate distance to determine shipping fee
    dist_km = 999.0
    shipping_fee = 0
    
    if address.lat is not None and address.lng is not None and settings.warehouse_lat and settings.warehouse_lng:
        dist_km = haversine(settings.warehouse_lat, settings.warehouse_lng, address.lat, address.lng)
    
    if dist_km <= settings.free_delivery_km:
        shipping_fee = 0
    elif dist_km <= settings.tier1_delivery_km:
        shipping_fee = settings.tier1_delivery_fee
    else:
        # Distance > 6km (or tier1 limit). "Will be communicated". 
        # For now, we set shipping_fee = 0 so it doesn't charge them incorrectly.
        shipping_fee = 0

    total_amount = subtotal + shipping_fee

    order = models.Order(
        user_id        = current_user.id,
        address_id     = payload.address_id,
        payment_method = payload.payment_method,
        subtotal       = subtotal,
        shipping_fee   = shipping_fee,
        total_amount   = total_amount,
    )
    db.add(order)
    db.flush()  # get order.id

    for item in order_items:
        item.order_id = order.id
        db.add(item)

    db.commit()
    db.refresh(order)
    return order


@router.get("/my", response_model=list[OrderSummary])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    return db.query(models.Order).filter(
        models.Order.user_id    == current_user.id,
        models.Order.is_deleted == False,
    ).order_by(models.Order.created_at.desc()).all()


@router.get("/my/{order_id}", response_model=OrderResponse)
def get_my_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    order = db.query(models.Order).filter(
        models.Order.id         == order_id,
        models.Order.user_id    == current_user.id,
        models.Order.is_deleted == False,
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


# ── Admin only ───────────────────────────────

@router.get("/", response_model=list[OrderResponse])
def list_all_orders(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    orders = db.query(models.Order).filter(
        models.Order.is_deleted == False
    ).order_by(models.Order.created_at.desc()).all()

    from app.routers.settings import get_or_create_settings
    settings = get_or_create_settings(db)

    for order in orders:
        if order.address and order.address.lat is not None and order.address.lng is not None and settings.warehouse_lat and settings.warehouse_lng:
            dist = haversine(settings.warehouse_lat, settings.warehouse_lng, order.address.lat, order.address.lng)
            order.distance_km = round(dist, 1)
        else:
            order.distance_km = None

    return orders


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    order = db.query(models.Order).filter(
        models.Order.id == order_id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status     = payload.status
    order.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(order)
    return order


@router.patch("/{order_id}/payment", response_model=OrderResponse)
def update_payment_status(
    order_id: int,
    payload: OrderPaymentUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    order = db.query(models.Order).filter(
        models.Order.id == order_id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.payment_status = payload.payment_status
    order.updated_at     = datetime.now(timezone.utc)
    db.commit()
    db.refresh(order)
    return order