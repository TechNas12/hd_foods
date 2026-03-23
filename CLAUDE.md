# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HD Masale (HD Foods) is an e-commerce platform for Indian spices and food products. Full-stack application with:
- **Backend**: FastAPI (Python) with SQLite/PostgreSQL, JWT auth, Redis caching
- **Frontend**: Next.js 15 (TypeScript, React 19, Tailwind CSS 4)

## Commands

### Backend (Python FastAPI)

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload --port 8000

# Access API docs
http://localhost:8000/docs
```

### Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

## Architecture

### Backend Structure (`/app`)

```
app/
├── database.py      # SQLAlchemy engine, session factory, get_db dependency
├── models.py        # SQLAlchemy ORM models (User, Product, Order, etc.)
├── dependencies.py  # Auth dependencies (JWT, password hashing, role guards)
├── redis_client.py  # Optional Upstash Redis caching layer
├── routers/         # API route handlers
│   ├── users.py     # Auth, profile, addresses
│   ├── products.py  # Product CRUD, caching
│   ├── categories.py
│   ├── orders.py    # Order placement, admin management
│   └── support.py   # Reviews, support tickets
└── schemas/         # Pydantic schemas for request/response validation
```

### Frontend Structure (`/frontend`)

```
frontend/
├── app/             # Next.js 15 App Router pages
│   ├── admin/       # Admin dashboard (products, orders, tickets)
│   ├── products/    # Product listing and detail pages
│   ├── cart/        # Shopping cart
│   ├── checkout/    # Checkout flow
│   ├── account/     # User account management
│   └── login/       # Authentication
├── lib/
│   ├── auth.ts      # JWT token management, login/logout
│   ├── api.ts       # API client wrappers for all endpoints
│   └── types.ts     # TypeScript type definitions
└── components/      # Reusable UI components
```

## Key Patterns

### Authentication Flow
- Local JWT auth (not Supabase Auth) with tokens stored in `localStorage`
- `lib/auth.ts` handles token management
- `lib/api.ts` injects `Authorization: Bearer <token>` for protected routes
- Admin routes use `require_admin()` dependency (checks `is_admin` flag)

### Database
- Default: SQLite (`hd_foods.db`) for local dev
- Production: PostgreSQL via Supabase (configure `DATABASE_URL`)
- All models use soft delete (`is_deleted`, `deleted_at` fields)
- Auto-create tables on startup via `models.Base.metadata.create_all()`

### Caching
- Optional Upstash Redis integration
- Product list (5 min TTL) and individual product (10 min TTL) cached
- Graceful no-op if Redis not configured
- Cache invalidation on create/update/delete

### API Structure
- RESTful endpoints with Pydantic validation
- Public endpoints: product listing, categories, reviews
- Protected endpoints: orders, profile, addresses, tickets
- Admin endpoints: product/category CRUD, order management, ticket management

## Environment Variables

### Backend (`.env`)
```
DATABASE_URL=sqlite:///./hd_foods.db
SECRET_KEY=<jwt-secret>
UPSTASH_REDIS_REST_URL=<redis-url>  # optional
UPSTASH_REDIS_REST_TOKEN=<redis-token>  # optional
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>  # for image storage
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

## Testing

Run a single test using pytest:
```bash
pytest -k test_name
pytest path/to/test_file.py
```

## Design System

Project uses `ui-ux-pro-max` skill for UI/UX decisions:
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system -p "Project Name"
```
Generates design tokens (colors, typography, styles) persisted to `design-system/MASTER.md`.
