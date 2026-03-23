import sys
import os

# Add parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app import models
from app.dependencies import get_password_hash

def replace_superuser(email: str, full_name: str, password: str, phone: str = None):
    db = SessionLocal()
    try:
        # 1. Identify current superuser(s)
        old_superusers = db.query(models.User).filter(models.User.is_superuser == True).all()
        old_emails = [u.email for u in old_superusers]
        
        # 2. Delete old superuser(s)
        # Note: We filter by email to avoid deleting the new user if they happened to have the same email (though unlikely in a replacement scenario)
        for old_user in old_superusers:
            if old_user.email != email:
                print(f"Deleting old Super User: {old_user.email}")
                db.delete(old_user)
        
        # 3. Create or Update the new Super User
        user = db.query(models.User).filter(models.User.email == email).first()
        if user:
            print(f"User with email '{email}' already exists. Promoting to Super User.")
            user.full_name = full_name
            user.password_hash = get_password_hash(password)
            if phone: user.phone = phone
            user.is_superuser = True
            user.is_admin = True
        else:
            print(f"Creating new Super User: {email}")
            user = models.User(
                full_name=full_name,
                email=email,
                password_hash=get_password_hash(password),
                phone=phone,
                is_admin=True,
                is_superuser=True
            )
            db.add(user)
        
        db.commit()
        print(f"Success: '{email}' is now the primary Super User.")
        if old_emails and email not in old_emails:
            print(f"Old superuser(s) {old_emails} have been removed.")
            
    except Exception as e:
        db.rollback()
        print(f"An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python replace_superuser.py <email> <full_name> <password> [phone]")
    else:
        email = sys.argv[1]
        full_name = sys.argv[2]
        password = sys.argv[3]
        phone = sys.argv[4] if len(sys.argv) > 4 else None
        replace_superuser(email, full_name, password, phone)
