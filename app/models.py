from sqlalchemy import Column, Integer, String, Text, Boolean, Numeric, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    full_name     = Column(String(100), nullable=False)
    email         = Column(String(255), unique=True, index=True, nullable=False)
    phone         = Column(String(15), nullable=True)
    password_hash = Column(String(255), nullable=False)
    member_since  = Column(DateTime(timezone=True), server_default=func.now())

    # Soft delete
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    addresses = relationship("Address", back_populates="user", cascade="all, delete-orphan")
    orders    = relationship("Order",   back_populates="user")
    reviews   = relationship("Review",  back_populates="user")
    tickets   = relationship("EnquiryTicket", back_populates="user")


class Address(Base):
    __tablename__ = "addresses"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    label      = Column(String(50), nullable=False)
    street     = Column(String(255), nullable=False)
    city       = Column(String(100), nullable=False)
    state      = Column(String(100), nullable=False)
    pincode    = Column(String(10),  nullable=False)
    is_default = Column(Boolean, default=False)

    # Soft delete
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    user   = relationship("User",  back_populates="addresses")
    orders = relationship("Order", back_populates="address")


class Product(Base):
    __tablename__ = "products"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(200), nullable=False)
    slug          = Column(String(220), unique=True, index=True, nullable=False)
    category      = Column(String(100), nullable=False)
    description   = Column(Text, nullable=True)
    base_price    = Column(Numeric(10, 2), nullable=False)
    rating        = Column(Float, default=0.0)
    reviews_count = Column(Integer, default=0)
    is_active     = Column(Boolean, default=True)

    # Soft delete
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    variants    = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    images      = relationship("ProductImage",   back_populates="product", cascade="all, delete-orphan")
    reviews     = relationship("Review",         back_populates="product")
    order_items = relationship("OrderItem",      back_populates="product")


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id             = Column(Integer, primary_key=True, index=True)
    product_id     = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    name           = Column(String(100), nullable=False)
    price_override = Column(Numeric(10, 2), nullable=True)
    stock_quantity = Column(Integer, default=0)

    # Soft delete
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    product     = relationship("Product",      back_populates="variants")
    images      = relationship("ProductImage", back_populates="variant")
    order_items = relationship("OrderItem",    back_populates="variant")


class ProductImage(Base):
    __tablename__ = "product_images"

    id         = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    variant_id = Column(Integer, ForeignKey("product_variants.id", ondelete="SET NULL"), nullable=True)
    image_url  = Column(String(500), nullable=False)
    is_primary = Column(Boolean, default=False)

    # Soft delete
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    product = relationship("Product",        back_populates="images")
    variant = relationship("ProductVariant", back_populates="images")


class Order(Base):
    __tablename__ = "orders"

    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    address_id     = Column(Integer, ForeignKey("addresses.id", ondelete="SET NULL"), nullable=True)
    status         = Column(String(50), default="Processing")
    subtotal       = Column(Numeric(10, 2), nullable=False)
    shipping_fee   = Column(Numeric(10, 2), default=0.00)
    total_amount   = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(50), nullable=False)
    payment_status = Column(String(50), default="Pending")
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
    updated_at     = Column(DateTime(timezone=True), onupdate=func.now())

    # Soft delete
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    user    = relationship("User",    back_populates="orders")
    address = relationship("Address", back_populates="orders")
    items   = relationship("OrderItem",     back_populates="order", cascade="all, delete-orphan")
    tickets = relationship("EnquiryTicket", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id         = Column(Integer, primary_key=True, index=True)
    order_id   = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id", ondelete="SET NULL"), nullable=True)
    quantity   = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)

    # Soft delete
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    order   = relationship("Order",          back_populates="items")
    product = relationship("Product",        back_populates="order_items")
    variant = relationship("ProductVariant", back_populates="order_items")


class EnquiryTicket(Base):
    __tablename__ = "enquiry_tickets"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    order_id   = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    subject    = Column(String(255), nullable=False)
    message    = Column(Text, nullable=False)
    status     = Column(String(20), default="Open")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Soft delete
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    user  = relationship("User",  back_populates="tickets")
    order = relationship("Order", back_populates="tickets")


class Review(Base):
    __tablename__ = "reviews"

    id         = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    user_id    = Column(Integer, ForeignKey("users.id",    ondelete="SET NULL"), nullable=True)
    rating     = Column(Integer, nullable=False)
    comment    = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Soft delete
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    product = relationship("Product", back_populates="reviews")
    user    = relationship("User",    back_populates="reviews")