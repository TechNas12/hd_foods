import sys
import os
import argparse
import getpass
from sqlalchemy.orm import Session

# Add the parent directory to sys.path so we can import from app
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from app.database import SessionLocal
from app.models import User
from app.routers.users import get_password_hash

def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_or_promote_superuser(email: str, password: str, name: str = "Admin"):
    db = next(get_db())
    
    # Check if user already exists
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        # Promote existing user
        user.is_admin = True
        
        # Update password if provided
        if password:
            user.password = get_password_hash(password)
            
        print(f"✅ Promoted existing user '{email}' to Superuser.")
    else:
        # Create new superuser
        if not password:
            print("❌ Error: Password is required for creating a new superuser.")
            return

        hashed_password = get_password_hash(password)
        new_user = User(
            email=email,
            password=hashed_password,
            full_name=name,
            is_admin=True,
            is_active=True
        )
        db.add(new_user)
        print(f"✅ Created new Superuser '{email}'.")
        
    db.commit()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create or promote a user to Superuser status.")
    parser.add_argument("--email", type=str, help="Email of the superuser")
    parser.add_argument("--name", type=str, default="Admin", help="Full name of the superuser (default: Admin)")
    
    args = parser.parse_args()
    
    email = args.email
    if not email:
        email = input("Enter Admin Email: ").strip()
        
    if not email:
        print("❌ Error: Email is required.")
        sys.exit(1)
        
    password = getpass.getpass(f"Enter Password for {email}: ").strip()
    
    if not password:
         print("❌ Error: Password cannot be empty.")
         sys.exit(1)

    create_or_promote_superuser(email, password, args.name)
