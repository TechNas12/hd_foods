from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.database import engine
from app import models
from app.routers import users, products, orders, support, categories, addresses
import os

load_dotenv()

# ─────────────────────────────────────────────
# Auto-create tables (safe for SQLite local dev)
# ─────────────────────────────────────────────
models.Base.metadata.create_all(bind=engine)


# ─────────────────────────────────────────────
# App instance
# ─────────────────────────────────────────────
app = FastAPI(
    title="HD Masale API",
    description="Backend API for HD Foods & Masale ecommerce platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─────────────────────────────────────────────
# CORS — allows Next.js frontend to call API
# ─────────────────────────────────────────────
ALLOWED_ORIGINS = [
    "http://localhost:3000",        # Next.js local dev
    "http://127.0.0.1:3000",        # Next.js local dev IP
    "http://192.168.56.1:3000",     # Local network IP
    "http://localhost:3001",        # alternate local port
    os.getenv("FRONTEND_URL", ""),  # production frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in ALLOWED_ORIGINS if o],  # filter empty strings
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Routers
# ─────────────────────────────────────────────
app.include_router(users.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(orders.router)
app.include_router(addresses.router)
app.include_router(support.router)


# ─────────────────────────────────────────────
# Root
# ─────────────────────────────────────────────
@app.get("/", tags=["Health"])
def read_root():
    return {
        "server":   "HD Masale Backend",
        "status":   "running",
        "docs":     "/docs",
        "version":  "1.0.0",
        "motto":    "Get going",
        "Developed by": "TechNas Technologies, India",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}