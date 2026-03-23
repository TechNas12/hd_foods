from app.database import SessionLocal, engine
from app import models
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def clear_products():
    db = SessionLocal()
    try:
        print("🗑️  Clearing product-related data...")
        
        # In a real DB with foreign keys, the order matters or we use cascade.
        # SQLAlchemy models have cascade="all, delete-orphan" for variants and images.
        # But for products, we can just delete all and it should cascade if the DB is set up right.
        # To be safe and thorough:
        
        # 1. Delete Product Images
        num_images = db.query(models.ProductImage).delete()
        print(f"   → Deleted {num_images} product images")
        
        # 2. Delete Product Variants
        num_variants = db.query(models.ProductVariant).delete()
        print(f"   → Deleted {num_variants} product variants")
        
        # 3. Delete Reviews
        num_reviews = db.query(models.Review).delete()
        print(f"   → Deleted {num_reviews} reviews")
        
        # 4. Delete Products
        num_products = db.query(models.Product).delete()
        print(f"   → Deleted {num_products} products")
        
        # 5. Nullify product references in OrderItems (to avoid breaking orders)
        num_order_items = db.query(models.OrderItem).update({models.OrderItem.product_id: None})
        print(f"   → Updated {num_order_items} order items (removed product references)")

        db.commit()
        print("\n✅ All product-related data has been cleared successfully!")
        print("Note: User accounts, addresses, and orders have been preserved.")
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error clearing products: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    clear_products()
