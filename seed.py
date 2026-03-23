"""
HD Foods & Masale — Database Seed Script
Run: python seed.py
Seeds the SQLite DB with realistic test data.
"""

from app.database import engine, SessionLocal, Base
from app import models
from app.dependencies import get_password_hash
from datetime import datetime, timezone, timedelta
import random
from decimal import Decimal
import uuid

# ──────────────────────────────────────────────
# 1. Drop & recreate all tables
# ──────────────────────────────────────────────
print("Refactoring: Dropping all tables...")
Base.metadata.drop_all(bind=engine)
print("Refactoring: Creating all tables...")
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # ──────────────────────────────────────────
    # 2. Users
    # ──────────────────────────────────────────
    print("Seeding users...")

    test_user = models.User(
        full_name="Rahul Sharma",
        email="test@hdfoods.com",
        phone="9876543210",
        password_hash=get_password_hash("password123"),
        is_admin=False,
    )
    admin_user = models.User(
        full_name="HD Admin",
        email="admin@hdfoods.com",
        phone="9876543211",
        password_hash=get_password_hash("admin123"),
        is_admin=True,
    )
    db.add_all([test_user, admin_user])
    db.flush()
    print(f"   → test user  id={test_user.id} (test@hdfoods.com)")
    print(f"   → admin user id={admin_user.id} (admin@hdfoods.com)")

    # ──────────────────────────────────────────
    # 3. Addresses
    # ──────────────────────────────────────────
    print("Seeding addresses...")

    addr1 = models.Address(
        user_id=test_user.id,
        label="Home",
        street="Flat 402, Heritage Residency, Indiranagar",
        city="Bengaluru",
        state="Karnataka",
        pincode="560038",
        is_default=True,
    )
    addr2 = models.Address(
        user_id=test_user.id,
        label="Office",
        street="Building 7, Tech Park SEZ, Whitefield",
        city="Bengaluru",
        state="Karnataka",
        pincode="560066",
        is_default=False,
    )
    db.add_all([addr1, addr2])
    db.flush()

    # ──────────────────────────────────────────
    # 3b. Categories
    # ──────────────────────────────────────────
    print("Seeding categories...")
    categories_data = [
        {"name": "Thepla",     "slug": "thepla",     "description": "Authentic Gujarati flatbreads"},
        {"name": "Masala",     "slug": "masala",     "description": "Hand-ground spice blends"},
        {"name": "Snacks",     "slug": "snacks",     "description": "Crispy traditional snacks"},
        {"name": "Pickles",    "slug": "pickles",    "description": "Traditional homemade pickles"},
        {"name": "Sweets",     "slug": "sweets",     "description": "Freshly made Indian sweets"},
        {"name": "Beverages",  "slug": "beverages",  "description": "Refreshing local drinks"},
        {"name": "Dry Fruits", "slug": "dry-fruits", "description": "Premium quality dry fruits"},
        {"name": "Combo",      "slug": "combo",      "description": "Curated value packs"},
        {"name": "Other",      "slug": "other",      "description": "Miscellaneous items"},
    ]
    category_map = {}
    for cdata in categories_data:
        cat = models.Category(**cdata)
        db.add(cat)
        db.flush()
        category_map[cdata["slug"]] = cat.id
    print(f"   → {len(categories_data)} categories seeded")

    # ──────────────────────────────────────────
    # 4. Products
    # ──────────────────────────────────────────
    print("Seeding products...")

    products_data = [
        {
            "name": "Methi Thepla",
            "slug": "methi-thepla",
            "category_id": category_map["thepla"],
            "subtitle": "Fresh & Nutritious Breakfast",
            "description": "Our signature Methi Thepla is a nutritional powerhouse made with fresh fenugreek leaves, whole wheat flour, and a secret blend of hand-ground spices. Perfectly soft and slightly tangy, these are vacuum-sealed to preserve freshness for your travels or daily breakfast. Traditionally served with mango pickle or spicy garlic chutney.",
            "base_price": Decimal("149"),
            "original_price": Decimal("199"),
            "rating": 4.8,
            "reviews_count": 0,
            "variants": [
                {"name": "Traditional Methi (Pack of 10)", "price_override": None, "stock_quantity": 45},
                {"name": "Garlic & Chilli (Pack of 10)", "price_override": Decimal("169"), "stock_quantity": 30},
            ],
            "images": [
                {"image_url": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800", "is_hero": True},
                {"image_url": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800", "is_hero": False},
            ],
        },
        {
            "name": "Authentic Garam Masala",
            "slug": "authentic-garam-masala",
            "category_id": category_map["masala"],
            "subtitle": "The Soul of Indian Cooking",
            "description": "Elevate your cooking with our stone-ground Garam Masala. Unlike factory-processed powders, our spices are roasted at low temperatures to retain their essential oils and aroma. This heritage blend includes premium black cardamom, cinnamon sticks, cloves, and mace, balanced perfectly for curries, biryanis, and everyday vegetables.",
            "base_price": Decimal("199"),
            "original_price": Decimal("249"),
            "rating": 4.9,
            "reviews_count": 0,
            "variants": [
                {"name": "Mild & Aromatic (100g)", "price_override": None, "stock_quantity": 88},
                {"name": "Extra Spicy (100g)", "price_override": Decimal("229"), "stock_quantity": 42},
                {"name": "Family Pack (250g)", "price_override": Decimal("449"), "stock_quantity": 25},
            ],
            "images": [
                {"image_url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800", "is_hero": True},
                {"image_url": "https://images.unsplash.com/photo-1599909533601-aa1045d0ba2c?w=800", "is_hero": False},
            ],
        },
        {
            "name": "Mango Pickle (Aam ka Achar)",
            "slug": "mango-pickle",
            "category_id": category_map["pickles"],
            "subtitle": "Traditional Grandma's Recipe",
            "description": "Tangy raw mangoes marinated in cold-pressed mustard oil with hand-ground spices. Our grandma's recipe hasn't changed in 50 years — no preservatives, no artificial colors. The perfect companion for your parathas, dal-chawal, and theplas.",
            "base_price": Decimal("249"),
            "original_price": Decimal("299"),
            "rating": 4.7,
            "reviews_count": 0,
            "variants": [
                {"name": "Traditional (250g)", "price_override": None, "stock_quantity": 60},
                {"name": "Extra Spicy (250g)", "price_override": Decimal("269"), "stock_quantity": 35},
                {"name": "Family Jar (500g)", "price_override": Decimal("449"), "stock_quantity": 20},
            ],
            "images": [
                {"image_url": "https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=800", "is_hero": True},
            ],
        },
        {
            "name": "Premium Turmeric Powder",
            "slug": "premium-turmeric-powder",
            "category_id": category_map["masala"],
            "subtitle": "High Curcumin Content",
            "description": "Heritage Lakadong turmeric from Meghalaya, known for the highest curcumin content in the world. Stone-ground to preserve the natural oils and deep golden color. Perfect for curries, golden milk, and traditional remedies. No additives, no fillers.",
            "base_price": Decimal("149"),
            "original_price": Decimal("179"),
            "rating": 4.8,
            "reviews_count": 0,
            "variants": [
                {"name": "Regular (100g)", "price_override": None, "stock_quantity": 100},
                {"name": "Premium (200g)", "price_override": Decimal("269"), "stock_quantity": 50},
            ],
            "images": [
                {"image_url": "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800", "is_hero": True},
            ],
        },
        {
            "name": "Kashmiri Red Chilli Powder",
            "slug": "kashmiri-red-chilli",
            "category_id": category_map["masala"],
            "description": "Vibrant color with mild heat — the secret behind every rich, red curry. Sun-dried Kashmiri chillies hand-picked from the valley. Adds stunning color to your dishes without overwhelming spiciness.",
            "base_price": Decimal("179"),
            "rating": 4.7,
            "reviews_count": 0,
            "variants": [
                {"name": "Standard (100g)", "price_override": None, "stock_quantity": 75},
                {"name": "Bulk Pack (250g)", "price_override": Decimal("399"), "stock_quantity": 30},
            ],
            "images": [
                {"image_url": "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=800", "is_hero": True},
            ],
        },
        {
            "name": "Special Chai Masala",
            "slug": "special-chai-masala",
            "category_id": category_map["masala"],
            "description": "Transform your daily tea into an aromatic experience. Our chai masala blends hand-cracked cardamom, cinnamon, ginger, and cloves. Just a pinch brings warmth to every sip. Perfect for cutting chai, masala tea, and winter beverages.",
            "base_price": Decimal("129"),
            "rating": 5.0,
            "reviews_count": 0,
            "variants": [
                {"name": "Classic Blend (50g)", "price_override": None, "stock_quantity": 120},
                {"name": "Strong Blend (50g)", "price_override": Decimal("149"), "stock_quantity": 60},
            ],
            "images": [
                {"image_url": "https://images.unsplash.com/photo-1563911892437-1feda0179e1b?w=800", "is_hero": True},
            ],
        },
        {
            "name": "Sada Thepla (Plain)",
            "slug": "sada-thepla-plain",
            "category_id": category_map["thepla"],
            "subtitle": "Perfect Travel Companion",
            "description": "Simple, wholesome traditional Gujarati theplas — perfect for travel snacks, office lunches, or quick breakfast. Made with whole wheat flour and a light spice seasoning. Vacuum-sealed for 30-day freshness.",
            "base_price": Decimal("89"),
            "original_price": Decimal("110"),
            "rating": 4.6,
            "reviews_count": 0,
            "variants": [
                {"name": "Pack of 5", "price_override": None, "stock_quantity": 80},
                {"name": "Pack of 10", "price_override": Decimal("159"), "stock_quantity": 50},
            ],
            "images": [
                {"image_url": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800", "is_hero": True},
            ],
        },
        {
            "name": "Black Pepper Whole",
            "slug": "black-pepper-whole",
            "category_id": category_map["masala"],
            "description": "Bold Malabar peppercorns, hand-picked from the spice gardens of Kerala. Intensely flavorful, these premium peppercorns add a sharp kick to any dish. Use whole or freshly crushed for maximum flavor.",
            "base_price": Decimal("299"),
            "rating": 4.9,
            "reviews_count": 0,
            "variants": [
                {"name": "Premium (100g)", "price_override": None, "stock_quantity": 55},
                {"name": "Bulk Pack (250g)", "price_override": Decimal("649"), "stock_quantity": 20},
            ],
            "images": [
                {"image_url": "https://images.unsplash.com/photo-1599909533601-aa1045d0ba2c?w=800", "is_hero": True},
            ],
        },
        {
            "name": "Kitchen King Masala",
            "slug": "kitchen-king-masala",
            "category_id": category_map["masala"],
            "description": "The all-rounder in your spice rack. Our Kitchen King is a balanced blend of 15 spices that works with every vegetable dish, paneer recipe, and dal. Stone-ground in small batches for fresh, full-bodied flavor.",
            "base_price": Decimal("169"),
            "rating": 4.6,
            "reviews_count": 0,
            "variants": [
                {"name": "Regular (100g)", "price_override": None, "stock_quantity": 90},
                {"name": "Value Pack (200g)", "price_override": Decimal("299"), "stock_quantity": 40},
            ],
            "images": [
                {"image_url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800", "is_hero": True},
            ],
        },
        {
            "name": "Banana Chips (Kerala Style)",
            "slug": "banana-chips-kerala",
            "category_id": category_map["snacks"],
            "description": "Crispy, golden banana chips fried in pure coconut oil. A beloved Kerala specialty, these chips are lightly salted and irresistibly crunchy. Perfect teatime snack or travel companion.",
            "base_price": Decimal("129"),
            "rating": 4.5,
            "reviews_count": 0,
            "variants": [
                {"name": "Salted (200g)", "price_override": None, "stock_quantity": 70},
                {"name": "Masala (200g)", "price_override": Decimal("149"), "stock_quantity": 45},
                {"name": "Jaggery Coated (200g)", "price_override": Decimal("159"), "stock_quantity": 30},
            ],
            "images": [
                {"image_url": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800", "is_hero": True},
            ],
        },
    ]

    product_objects = []
    for pdata in products_data:
        variants = pdata.pop("variants")
        images = pdata.pop("images")

        product = models.Product(**pdata)
        db.add(product)
        db.flush()

        for v in variants:
            db.add(models.ProductVariant(**v, product_id=product.id))

        for img in images:
            img_id = str(uuid.uuid4())
            db.add(models.ProductImage(
                **img, 
                id=img_id, 
                product_id=product.id,
                storage_path="seed-images/" + img_id
            ))

        product_objects.append(product)
        print(f"   → {product.name} (slug={product.slug})")

    db.flush()

    # ──────────────────────────────────────────
    # 5. Reviews
    # ──────────────────────────────────────────
    print("Seeding reviews...")

    reviews_data = [
        {"product_id": product_objects[0].id, "user_id": test_user.id, "rating": 5, "comment": "Exactly like my grandmother makes! Very soft even after 3 days. The vacuum packaging keeps them fresh."},
        {"product_id": product_objects[1].id, "user_id": test_user.id, "rating": 5, "comment": "The aroma is incredible. Just a pinch is enough to transform any dish. Best garam masala I've tried!"},
        {"product_id": product_objects[2].id, "user_id": test_user.id, "rating": 4, "comment": "Really tasty but slightly more oily than expected. The spice level is perfect though."},
        {"product_id": product_objects[5].id, "user_id": test_user.id, "rating": 5, "comment": "This chai masala has completely changed my morning tea routine. Pure cardamom flavor!"},
        {"product_id": product_objects[9].id, "user_id": test_user.id, "rating": 4, "comment": "Crispy and addictive! The masala flavor variant is my favorite. Great for evening snacks."},
    ]

    for rdata in reviews_data:
        review = models.Review(**rdata)
        db.add(review)

        # Update product rating
        prod = db.query(models.Product).get(rdata["product_id"])
        if prod:
            total = (prod.rating * prod.reviews_count) + rdata["rating"]
            prod.reviews_count += 1
            prod.rating = round(total / prod.reviews_count, 1)

    db.flush()
    print(f"   → {len(reviews_data)} reviews seeded")

    # ──────────────────────────────────────────
    # 6. Orders
    # ──────────────────────────────────────────
    print("Seeding orders...")

    now = datetime.now(timezone.utc)

    # Order 1 — Delivered
    order1 = models.Order(
        user_id=test_user.id,
        address_id=addr1.id,
        status="Delivered",
        subtotal=Decimal("847"),
        shipping_fee=Decimal("0"),
        total_amount=Decimal("847"),
        payment_method="UPI",
        payment_status="Paid",
        created_at=now - timedelta(days=7),
    )
    db.add(order1)
    db.flush()
    db.add(models.OrderItem(order_id=order1.id, product_id=product_objects[1].id, quantity=2, unit_price=Decimal("199")))
    db.add(models.OrderItem(order_id=order1.id, product_id=product_objects[0].id, quantity=3, unit_price=Decimal("149")))

    # Order 2 — Shipped
    order2 = models.Order(
        user_id=test_user.id,
        address_id=addr2.id,
        status="Shipped",
        subtotal=Decimal("348"),
        shipping_fee=Decimal("0"),
        total_amount=Decimal("348"),
        payment_method="UPI",
        payment_status="Paid",
        created_at=now - timedelta(days=3),
    )
    db.add(order2)
    db.flush()
    db.add(models.OrderItem(order_id=order2.id, product_id=product_objects[8].id, quantity=1, unit_price=Decimal("169")))
    db.add(models.OrderItem(order_id=order2.id, product_id=product_objects[3].id, quantity=1, unit_price=Decimal("149")))

    # Order 3 — Processing
    order3 = models.Order(
        user_id=test_user.id,
        address_id=addr1.id,
        status="Processing",
        subtotal=Decimal("129"),
        shipping_fee=Decimal("50"),
        total_amount=Decimal("179"),
        payment_method="COD",
        payment_status="Pending",
        created_at=now - timedelta(hours=6),
    )
    db.add(order3)
    db.flush()
    db.add(models.OrderItem(order_id=order3.id, product_id=product_objects[5].id, quantity=1, unit_price=Decimal("129")))

    print(f"   → 3 orders seeded (Delivered, Shipped, Processing)")

    # ──────────────────────────────────────────
    # 7. Enquiry Tickets
    # ──────────────────────────────────────────
    print("Seeding enquiry tickets...")

    ticket1 = models.EnquiryTicket(
        user_id=test_user.id,
        order_id=order1.id,
        subject="Delivery Delay",
        message="My order was supposed to arrive in 3 days but it took 5 days. Please look into this.",
        status="Resolved",
    )
    ticket2 = models.EnquiryTicket(
        user_id=test_user.id,
        subject="General Enquiry",
        message="Do you have any plans to introduce organic spice certification for your products?",
        status="Open",
    )
    db.add_all([ticket1, ticket2])

    print(f"   → 2 enquiry tickets seeded")

    # ──────────────────────────────────────────
    # Commit everything
    # ──────────────────────────────────────────
    db.commit()
    print("\nDatabase seeded successfully!")
    print(f"   Products:  {len(product_objects)}")
    print(f"   Users:     2 (test + admin)")
    print(f"   Addresses: 2")
    print(f"   Orders:    3")
    print(f"   Reviews:   {len(reviews_data)}")
    print(f"   Tickets:   2")

except Exception as e:
    db.rollback()
    print(f"\nSeed failed: {e}")
    raise
finally:
    db.close()
