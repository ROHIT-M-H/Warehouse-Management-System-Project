# Warehouse Management System (WMS)

A full-stack Warehouse Management System built with Django REST Framework and React + TypeScript.

---

## Tech Stack

| Layer     | Technology                                           |
|-----------|------------------------------------------------------|
| Backend   | Python 3.12, Django 5, Django REST Framework         |
| Auth      | JWT (SimpleJWT) — access token (30 min) + refresh (7 days) |
| Frontend  | React 18, TypeScript, Vite, Atomic Design            |
| Database  | PostgreSQL (SQLite for dev/demo)                     |
| Styling   | Pure CSS variables — supports dark mode              |

---

## Setup Instructions

### Prerequisites — install these on your laptop

| Tool          | Version  | Install                                   |
|---------------|----------|-------------------------------------------|
| Python        | 3.10+    | https://python.org                        |
| Node.js       | 18+      | https://nodejs.org                        |
| PostgreSQL    | 14+      | https://postgresql.org (or use SQLite)    |
| pip           | latest   | bundled with Python                       |

---

### Backend Setup

```bash
# 1. Enter backend folder
cd wms_backend

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. (Optional) Set up PostgreSQL
#    Create DB and user, then edit wms_backend/settings.py
#    Uncomment the PostgreSQL DATABASES block and fill credentials

# 5. Run migrations
python manage.py migrate

# 6. Seed demo data (creates admin + 2 operators + sample products/inventory)
python seed.py

# 7. Start the server
python manage.py runserver
# → http://localhost:8000
```

### Frontend Setup

```bash
# 1. Enter frontend folder
cd wms-frontend

# 2. Install packages
npm install

# 3. Start dev server
npm run dev
# → http://localhost:3000
```

---

## Demo Credentials

| Role      | Email             | Password       |
|-----------|-------------------|----------------|
| Admin     | admin@wms.com     | Admin@1234     |
| Operator  | bob@wms.com       | Operator@1234  |
| Operator  | carol@wms.com     | Operator@1234  |

---

## Folder Structure

```
wms_backend/
├── core/
│   ├── models.py          # All DB models
│   ├── serializers.py     # Validation + serialization
│   ├── views.py           # API viewsets + dashboard
│   ├── permissions.py     # IsAdmin, IsOperator, IsAssignedOperator
│   ├── filters.py         # Advanced filtering (django-filter)
│   ├── urls.py            # API routes
│   └── admin.py           # Django admin
├── wms_backend/
│   ├── settings.py
│   └── urls.py
├── requirements.txt
└── seed.py

wms-frontend/src/
├── atoms/          # Button, Input, Select, Badge, Card, Spinner, TextArea
├── molecules/      # StatCard, SearchBar, Modal, ConfirmDialog, Pagination,
│                   # BarcodeScanner, EmptyState, PageHeader, FilterPanel
├── organisms/      # Sidebar, DataTable, ProductForm, OperatorForm,
│                   # InventoryForm, StockMovementForm
├── pages/          # LoginPage, DashboardPage, ProductsPage, InventoryPage,
│                   # StockMovementsPage, OperatorsPage, WarehousesPage, CategoriesPage
├── context/        # AuthContext, ThemeContext
├── hooks/          # useApi, usePagination
├── services/       # api.ts, auth.service.ts, wms.service.ts
├── types/          # index.ts — all TypeScript interfaces
└── utils/          # formatters, badge helpers, error extractor
```

---

## Architecture Overview

```
React (Atomic Design)
      │  JWT Bearer token
      ▼
Django REST Framework
      │  ORM queries
      ▼
PostgreSQL / SQLite
```

- **Stateless auth**: JWT stored in localStorage; auto-refresh on 401 via axios interceptor.
- **Role-based routing**: `RequireAuth` and `RequireAdmin` guards on every protected route.
- **Server-side permissions**: Every DRF viewset enforces `IsAdmin` / `IsOperator` / `IsAssignedOperator`.
- **Atomic inventory updates**: Stock movement completion wrapped in `transaction.atomic()` with `select_for_update()`.

---

## Design Decisions & Assumptions

1. **Warehouse as a model** — `Warehouse` is a proper DB table (not just a text field), enabling multi-warehouse tracking and future operator-warehouse assignment.
2. **Soft delete for products** — DELETE sets `status=inactive`; inventory history is preserved.
3. **Pending = reserved** — When a Stock Out movement is created, `quantity_reserved` is incremented immediately, preventing double-allocation.
4. **Only assigned operator can complete** — `IsAssignedOperator` permission class enforces this at object level.
5. **Pending Stock Updates** on operator dashboard = movements with `status=pending` assigned to that operator.
6. **Active Operators** stat = users with `role=operator` and `status=active`.
7. **Adjustment movement** sets the inventory to the specified quantity (absolute, not delta).
8. **SQLite for dev** — The settings file ships with SQLite so you can run it immediately without a PostgreSQL setup. Switch by uncommenting the PostgreSQL block.

---

## Bonus Features Implemented

| Feature            | Details                                                              |
|--------------------|----------------------------------------------------------------------|
| Advanced Filtering | Date range, category, status, warehouse, operator, stock level       |
| Barcode Support    | BarcodeScanner molecule on product + movement forms; auto-fills SKU  |
| Dark Mode          | CSS variable tokens; toggle persisted in localStorage                |
| Pagination         | Page-number pagination on all list views (20 per page)               |

---

## API Endpoints

| Method | Endpoint                        | Access   |
|--------|---------------------------------|----------|
| POST   | /api/auth/login/                | Public   |
| POST   | /api/auth/logout/               | Auth     |
| POST   | /api/auth/refresh/              | Auth     |
| GET    | /api/auth/me/                   | Auth     |
| GET    | /api/dashboard/admin/           | Admin    |
| GET    | /api/dashboard/operator/        | Operator |
| CRUD   | /api/products/                  | Admin RW / Operator R |
| CRUD   | /api/inventory/                 | Admin RW / Operator R |
| CRUD   | /api/stock-movements/           | Admin CRD / Operator R+complete |
| CRUD   | /api/operators/                 | Admin    |
| CRUD   | /api/warehouses/                | Admin    |
| CRUD   | /api/categories/                | Admin    |

---

## Future Improvements

- Docker Compose setup (backend + frontend + postgres in one command)
- GitHub Actions CI (lint + test on push)
- Unit tests (pytest-django + React Testing Library)
- CSV product import
- Inventory movement history timeline view
- Email notifications on low stock
- Operator–warehouse assignment (restrict operators to specific warehouses)
- WebSocket real-time dashboard updates
