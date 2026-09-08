# E-commerce Platform — FastAPI + React + PostgreSQL

Full-stack e-commerce application with JWT-based customer/admin roles, a product catalog with search and filtering, a shopping cart, checkout, and full order lifecycle management.

**Live Demo:** _add after deployment_
**Backend API Docs:** _add after deployment_ (`/docs` — interactive Swagger UI)

**Demo accounts:**
- Admin: `admin@demo.com` / `Admin123!`
- Customer: register your own account, or use the checkout flow directly

## Features

**Customer**
- Browse catalog with search, category filter, and pagination
- Product detail pages
- Shopping cart (persists across page refresh)
- Checkout with shipping details and a demo payment flow
- Order history and order detail views

**Admin**
- Product CRUD with soft delete (deactivated products stay in historical orders)
- Order management with status updates (paid → shipped → delivered/cancelled)
- Dashboard with revenue, order count, product count, and low-stock stats

**Engineering details worth noting**
- Checkout is a single database transaction: it locks the relevant product rows, validates stock for every line item before mutating anything, computes prices/totals from the live database price (a client-submitted price is always ignored), decrements stock, and snapshots the product name/price into the order so historical orders stay accurate even if a product is later edited or removed
- Role-based access control: registration always creates a `customer`; the admin account is seed-only

## Architecture

```
 Browser (React + TypeScript, Vite)
        |  HTTPS / JSON
        v
 FastAPI backend (Docker, Render)
        |  SQLAlchemy
        v
 PostgreSQL
```

Auth: JWT bearer tokens, issued on login, verified on every protected request via a FastAPI dependency.

## Setup

**Backend**
```bash
cd backend
python -m venv .venv && .venv\Scripts\activate     # Windows
pip install -r requirements.txt
cp .env.example .env                                # then fill in real values
alembic upgrade head
python -m app.seed
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env
```

**Or, everything via Docker:**
```bash
docker compose up -d --build
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.seed
```

## Run

```bash
# Backend (from backend/)
uvicorn app.main:app --reload

# Frontend (from frontend/)
npm run dev

# Or both together
docker compose up
```

Backend: `http://localhost:8000` (docs at `/docs`) · Frontend: `http://localhost:5173`

## Project Structure

```
ecommerce-app/
├── backend/
│   ├── app/
│   │   ├── main.py, config.py, database.py
│   │   ├── models/        # SQLAlchemy: user, category, product, order
│   │   ├── schemas/       # Pydantic request/response models
│   │   ├── routers/       # auth, categories, products, orders, admin
│   │   └── auth/          # JWT + bcrypt, RBAC dependencies
│   ├── alembic/           # migrations
│   └── tests/             # pytest — auth, RBAC, checkout transaction cases
├── frontend/
│   └── src/
│       ├── api/           # typed API client per resource
│       ├── context/       # AuthContext, CartContext
│       ├── components/    # layout, product, cart, admin
│       └── pages/         # customer + admin pages
└── docker-compose.yml
```

## Resume Bullets

- Built a full-stack e-commerce platform with FastAPI + PostgreSQL and a React/TypeScript frontend, implementing JWT authentication with customer/admin role-based access control
- Designed a relational schema with price and product-name snapshotting on order line items, preserving historical order accuracy independent of later catalog changes
- Implemented a transactional checkout flow with row-level locking that validates stock and computes totals server-side, preventing race conditions and client-side price tampering
- Containerized the backend with Docker and deployed it alongside a managed PostgreSQL instance, with the frontend deployed separately and wired up via CORS
