# Warehouse Management System (WMS)

A full-stack Warehouse Management System built with **Django REST Framework** (backend) and **React + TypeScript** (frontend), following Atomic Design principles.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running the Project](#running-the-project)
- [Demo Credentials](#demo-credentials)
- [Architecture Overview](#architecture-overview)
- [Design Decisions](#design-decisions)
- [Assumptions](#assumptions)
- [API Endpoints Summary](#api-endpoints-summary)
- [Bonus Features](#bonus-features)
- [Future Improvements](#future-improvements)

---

## Project Overview

A simplified Warehouse Management System that allows:

- **Administrators** to manage products, inventory, warehouses, categories, and warehouse operators — and monitor all stock movements.
- **Warehouse Operators** to view their assigned stock movements, record stock received/issued, and update inventory quantities.

---

## Tech Stack

| Layer     | Technology                                                      |
|-----------|-----------------------------------------------------------------|
| Backend   | Python 3.12, Django 5, Django REST Framework                    |
| Auth      | JWT via `djangorestframework-simplejwt` (access + refresh tokens) |
| Frontend  | React 18, TypeScript, Vite                                      |
| UI Design | Atomic Design (atoms → molecules → organisms → pages)           |
| Database  | SQLite (default/dev) · PostgreSQL (production-ready)            |
| Styling   | Pure CSS variables · Dark mode supported                        |

---

## Folder Structure

```
wms/
├── wms_backend/                  # Django backend
│   ├── core/
│   │   ├── models.py             # All DB models (User, Product, Inventory, StockMovement, etc.)
│   │   ├── serializers.py        # Validation + serialization logic
│   │   ├── views.py              # API viewsets + dashboard views
│   │   ├── permissions.py        # IsAdmin, IsOperator, IsAssignedOperator
│   │   ├── filters.py            # Advanced filtering (django-filter)
│   │   ├── urls.py               # All API routes
│   │   └── admin.py              # Django admin configuration
│   ├── wms_backend/
│   │   ├── settings.py           # Project settings (JWT, CORS, DRF config)
│   │   └── urls.py               # Root URL config
│   ├── requirements.txt
│   ├── seed.py                   # Demo data seeder
│   └── manage.py
│
└── wms-frontend/                 # React frontend
    └── src/
        ├── atoms/                # Smallest UI units
        │   ├── Button.tsx
        │   ├── Input.tsx
        │   ├── Select.tsx
        │   ├── Badge.tsx
        │   ├── Card.tsx
        │   ├── Spinner.tsx
        │   └── TextArea.tsx
        ├── molecules/            # Combinations of atoms
        │   ├── StatCard.tsx
        │   ├── SearchBar.tsx
        │   ├── Modal.tsx
        │   ├── ConfirmDialog.tsx
        │   ├── Pagination.tsx
        │   ├── BarcodeScanner.tsx
        │   ├── FilterPanel.tsx
        │   ├── EmptyState.tsx
        │   └── PageHeader.tsx
        ├── organisms/            # Complex reusable sections
        │   ├── Sidebar.tsx
        │   ├── DataTable.tsx
        │   ├── ProductForm.tsx
        │   ├── OperatorForm.tsx
        │   ├── InventoryForm.tsx
        │   └── StockMovementForm.tsx
        ├── pages/                # Full pages composed from organisms
        │   ├── LoginPage.tsx
        │   ├── DashboardPage.tsx
        │   ├── ProductsPage.tsx
        │   ├── InventoryPage.tsx
        │   ├── StockMovementsPage.tsx
        │   ├── OperatorsPage.tsx
        │   ├── WarehousesPage.tsx
        │   └── CategoriesPage.tsx
        ├── context/              # React context providers
        │   ├── AuthContext.tsx   # Auth state + login/logout
        │   └── ThemeContext.tsx  # Dark/light mode toggle
        ├── hooks/                # Custom React hooks
        │   ├── useApi.ts
        │   └── usePagination.ts
        ├── services/             # API communication layer
        │   ├── api.ts            # Axios instance + interceptors
        │   ├── auth.service.ts
        │   └── wms.service.ts
        ├── types/
        │   └── index.ts          # All TypeScript interfaces
        ├── utils/
        │   └── index.ts          # Formatters, badge helpers, error extractor
        └── App.tsx               # Routes + guards
```

---

## Prerequisites

Install these on your machine before starting:

| Tool       | Version | Download                        |
|------------|---------|---------------------------------|
| Python     | 3.10+   | https://python.org              |
| Node.js    | 18+     | https://nodejs.org              |
| PostgreSQL | 14+     | https://postgresql.org (optional) |
| pip        | latest  | Bundled with Python             |

---

## Backend Setup

### 1. Navigate to the backend folder

```bash
cd wms_backend
```

### 2. Create and activate a virtual environment

```bash
# macOS / Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure the database

**Option A — SQLite (default, no setup needed)**

The project works out of the box with SQLite. Skip to step 5.

**Option B — PostgreSQL (recommended for production)**

First create the database:

```sql
-- Run in psql or pgAdmin
CREATE DATABASE wms_db;
CREATE USER wms_user WITH PASSWORD 'wms1234';
GRANT ALL PRIVILEGES ON DATABASE wms_db TO wms_user;
```

Then open `wms_backend/wms_backend/settings.py` and replace the `DATABASES` block:

```python
# Remove the SQLite block and uncomment this:
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'wms_db',
        'USER': 'wms_user',
        'PASSWORD': 'wms1234',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### 5. Run migrations

```bash
python manage.py migrate
```

### 6. Seed demo data

```bash
python seed.py
```

This creates:
- 1 admin user
- 2 warehouse operators
- 4 categories, 3 warehouses, 6 products
- 7 inventory records, 3 pending stock movements

### 7. Start the backend server

```bash
python manage.py runserver
```

Backend runs at: `http://localhost:8000`

> **Note:** The homepage (`http://localhost:8000`) shows a 404 — this is expected. The backend only serves `http://localhost:8000/api/` and `http://localhost:8000/admin/`.

---

## Frontend Setup

### 1. Navigate to the frontend folder

```bash
cd wms-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the dev server

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

> If port 5173 is busy, Vite picks the next available port. Check your terminal output.

### 4. Build for production

```bash
npm run build
```

---

## Running the Project

Open **two terminals** and run both servers simultaneously:

```bash
# Terminal 1 — Backend
cd wms_backend
source venv/bin/activate      # Windows: venv\Scripts\activate
python manage.py runserver

# Terminal 2 — Frontend
cd wms-frontend
npm run dev
```

Then open **`http://localhost:5173`** in your browser.

---

## Demo Credentials

| Role               | Email             | Password       |
|--------------------|-------------------|----------------|
| Administrator      | admin@wms.com     | Admin@1234     |
| Warehouse Operator | bob@wms.com       | Operator@1234  |
| Warehouse Operator | carol@wms.com     | Operator@1234  |

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│   Browser — React + TypeScript          │
│   Atomic Design · JWT in localStorage   │
│   Route guards · Context API for state  │
└──────────────┬──────────────────────────┘
               │  HTTP · Bearer token · JSON
┌──────────────▼──────────────────────────┐
│   Django REST Framework (Python)        │
│   JWT auth · Permissions · Filters      │
│   Atomic inventory updates (DB tx)      │
└──────────────┬──────────────────────────┘
               │  Django ORM · psycopg2
┌──────────────▼──────────────────────────┐
│   PostgreSQL / SQLite                   │
│   6 tables · FK constraints             │
│   Unique SKU · qty ≥ 0 enforced         │
└─────────────────────────────────────────┘
```

**Auth flow:**
1. User logs in → receives `access` token (30 min) + `refresh` token (7 days)
2. Access token sent as `Authorization: Bearer <token>` header on every request
3. On 401, Axios interceptor auto-calls `/auth/refresh/` and retries
4. On page refresh, stored user info rehydrated from `localStorage` and validated via `/auth/me/`
5. Logout blacklists the refresh token server-side (SimpleJWT token blacklist)

**RBAC enforced at 3 layers:**
- Frontend route guards (`RequireAuth`, `RequireAdmin`)
- DRF permission classes on every viewset (`IsAdmin`, `IsOperator`, `IsAssignedOperator`)
- Database constraints (unique, non-negative quantities)

---

## Design Decisions

| Decision | Reasoning |
|---|---|
| **Soft delete for products** | `DELETE` sets `status=inactive` rather than removing the row. This preserves all inventory and stock movement history. |
| **Warehouse as a model** | `Warehouse` is a proper DB table, not just a text field. Enables multi-warehouse inventory tracking and future operator-warehouse assignments. |
| **Stock Out reservation** | When a Stock Out movement is created, `quantity_reserved` is incremented immediately. This prevents double-allocation before the operator completes the movement. |
| **Atomic movement completion** | `StockMovement` completion is wrapped in `transaction.atomic()` with `select_for_update()` to prevent race conditions on inventory updates. |
| **JWT over sessions** | Stateless auth scales better and works cleanly with a separate React SPA without CSRF complexity. |
| **Atomic Design on frontend** | Each layer (atom → molecule → organism → page) only depends on the layer below. Makes components independently testable and replaceable. |
| **SQLite default** | Lets anyone clone and run the project instantly with zero DB setup. PostgreSQL is one config change away. |
| **CSS variables for theming** | All colors and spacing defined as CSS custom properties. Dark mode is a single `data-theme="dark"` attribute on `<html>` — no JS style manipulation. |

---

## Assumptions

1. **Pending Stock Updates** on the operator dashboard = movements with `status=pending` assigned to that operator.
2. **Active Warehouse Operators** stat on admin dashboard = users with `role=operator` and `status=active` (not "logged in today").
3. **Stock movement flow** — Admin creates and assigns a movement; the assigned operator marks it complete. Only the assigned operator (or admin) can complete/cancel it.
4. **Adjustment movement** sets `quantity_available` to the specified quantity (absolute value, not a delta).
5. **Product delete** is a soft delete — it sets `status=inactive`. Hard deletes are blocked because inventory records reference the product.
6. **Email is immutable** once an operator is created. Only `name` and `status` can be updated.
7. **Categories cannot be deleted** if any products are using them (Django `PROTECT` on the FK).

---

## API Endpoints Summary

| Method | Endpoint                        | Access            |
|--------|---------------------------------|-------------------|
| POST   | /api/auth/login/                | Public            |
| POST   | /api/auth/logout/               | Authenticated     |
| POST   | /api/auth/refresh/              | Authenticated     |
| GET    | /api/auth/me/                   | Authenticated     |
| GET    | /api/dashboard/admin/           | Admin only        |
| GET    | /api/dashboard/operator/        | Operator only     |
| GET/POST | /api/products/                | Admin W · All R   |
| GET/PUT/DELETE | /api/products/{id}/   | Admin W · All R   |
| GET/POST | /api/inventory/               | Admin W · All R   |
| PUT    | /api/inventory/{id}/            | Admin only        |
| GET/POST | /api/stock-movements/         | Admin C · All R   |
| PUT    | /api/stock-movements/{id}/      | Admin/Assigned Op |
| GET/POST/PUT | /api/operators/         | Admin only        |
| GET/POST | /api/warehouses/              | Admin W · All R   |
| GET/POST | /api/categories/              | Admin W · All R   |

All list endpoints support: `search`, `page`, `ordering` query params.
Inventory and movement endpoints support advanced filtering (category, warehouse, status, date range, stock level).

---

## Bonus Features

| Feature            | Implementation                                                       |
|--------------------|----------------------------------------------------------------------|
| **Advanced Filtering** | `django-filter` on all list endpoints; date range, category, status, warehouse, operator, stock level on frontend `FilterPanel` |
| **Barcode Support**    | `BarcodeScanner` molecule on product and stock movement forms; clicking "Scan" focuses the input for hardware scanner input; auto-fills barcode field when a product is selected |
| **Dark Mode**          | CSS variable tokens; toggle in sidebar persisted to `localStorage`; entire theme switches via `data-theme` attribute with no JS style mutations |
| **Pagination**         | Page-number pagination on all list views (20 per page); `Pagination` molecule with smart page number display |

---

## Future Improvements

- **Docker Compose** — single `docker-compose up` to run backend + frontend + PostgreSQL
- **GitHub Actions CI** — lint + test on every push
- **Unit tests** — `pytest-django` for backend, React Testing Library for frontend
- **CSV product import** — bulk upload products via CSV file
- **Inventory movement history timeline** — visual audit trail per product
- **Email notifications** — alert admin when stock falls below minimum level
- **Operator–warehouse assignment** — restrict operators to specific warehouses only
- **WebSocket real-time dashboard** — live inventory updates without page refresh
- **Role-based field visibility** — operators see a simplified view of product data
