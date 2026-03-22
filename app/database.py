from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hd_foods.db")

# -------------------------------------------------------------------
# SQLite needs this extra argument; PostgreSQL does NOT.
# connect_args is ignored by psycopg2, so this is safe for both.
# -------------------------------------------------------------------
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# -------------------------------------------------------------------
# Dependency — inject this into every FastAPI route that needs the DB
# Usage: db: Session = Depends(get_db)
# -------------------------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()