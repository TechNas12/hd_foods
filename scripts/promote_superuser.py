import sys
import os

# Add parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app import models

def promote(email: str):
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            print(f"Error: User with email '{email}' not found.")
            return

        # Ensure only one superuser exists
        db.query(models.User).update({models.User.is_superuser: False})
        
        user.is_superuser = True
        user.is_admin = True # Superuser must be admin
        db.commit()
        print(f"Success: User '{email}' has been promoted to Super User.")
        print("Note: This user is now immutable via the web interface.")
    except Exception as e:
        db.rollback()
        print(f"An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python promote_superuser.py <email>")
    else:
        promote(sys.argv[1])
