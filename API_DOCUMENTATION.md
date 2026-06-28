# WMS API Documentation

Base URL: `http://localhost:8000/api`

All protected endpoints require: `Authorization: Bearer <access_token>`

---

## Authentication

### POST /auth/login/
Login and receive JWT tokens.

**Request**
```json
{ "email": "admin@wms.com", "password": "Admin@1234" }
```
**Response 200**
```json
{
  "access": "<token>",
  "refresh": "<token>",
  "user": { "id": 1, "name": "Alice Admin", "email": "admin@wms.com", "role": "admin", "status": "active" }
}
```
**Errors:** `400` invalid credentials · `400` account disabled

---

### POST /auth/logout/
Blacklist the refresh token.

**Request:** `{ "refresh": "<refresh_token>" }`
**Response 200:** `{ "detail": "Successfully logged out." }`

---

### POST /auth/refresh/
Get a new access token.

**Request:** `{ "refresh": "<refresh_token>" }`
**Response 200:** `{ "access": "<new_token>", "refresh": "<rotated_token>" }`

---

### GET /auth/me/
Get current user info (used on page refresh to rehydrate auth state).

**Response 200:** `{ "id": 1, "name": "...", "email": "...", "role": "admin", "status": "active" }`

---

## Dashboard

### GET /dashboard/admin/ `[Admin only]`
**Response 200**
```json
{
  "total_products": 6,
  "total_inventory_units": 154,
  "low_stock_items": 3,
  "active_operators": 2,
  "recent_movements": [...],
  "low_stock_list": [...]
}
```

### GET /dashboard/operator/ `[Operator only]`
**Response 200**
```json
{
  "products_received_today": 2,
  "products_issued_today": 1,
  "pending_stock_updates": 3,
  "low_stock_alerts": 3,
  "pending_movements": [...]
}
```

---

## Products `[Admin: full CRUD | Operator: GET only]`

### GET /products/
**Query params:** `search`, `category`, `status`, `barcode`, `page`, `ordering`

**Response 200**
```json
{
  "count": 6,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1, "name": "USB-C Hub 7-Port", "sku": "ELEC-001",
      "category": 1, "category_name": "Electronics",
      "unit_price": "24.99", "minimum_stock_level": 10,
      "status": "active", "barcode": "123456789012",
      "created_at": "2024-01-01T00:00:00Z", "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /products/ `[Admin only]`
**Request**
```json
{
  "name": "USB-C Hub", "sku": "ELEC-010", "category": 1,
  "unit_price": "24.99", "minimum_stock_level": 10,
  "status": "active", "description": "", "barcode": "123456789012"
}
```
**Errors:** `400` name required · `400` SKU not unique · `400` price negative · `400` min stock negative

### GET /products/{id}/
Returns full detail including `inventory_records` array.

### PUT/PATCH /products/{id}/ `[Admin only]`
Same fields as POST. PATCH allows partial update.

### DELETE /products/{id}/ `[Admin only]`
Soft delete — sets `status=inactive`. Returns `200` with detail message.

---

## Operators `[Admin only]`

### GET /operators/
**Query params:** `search`, `status`, `page`

### POST /operators/
```json
{ "name": "Bob", "email": "bob@wms.com", "password": "Secure@123", "status": "active" }
```
**Errors:** `400` email not unique · `400` password too short

### GET /operators/{id}/

### PUT/PATCH /operators/{id}/
Only `name` and `status` can be updated (email is immutable).

---

## Inventory `[Admin: full CRUD | Operator: GET only]`

### GET /inventory/
**Query params:** `search`, `category`, `warehouse`, `product_status`, `low_stock`, `min_quantity`, `max_quantity`, `page`

**Response 200**
```json
{
  "results": [{
    "id": 1, "product": 1, "product_name": "USB-C Hub", "product_sku": "ELEC-001",
    "product_min_stock": 10, "product_status": "active", "category_name": "Electronics",
    "warehouse": 1, "warehouse_name": "Main Warehouse",
    "quantity_available": 45, "quantity_reserved": 0,
    "is_low_stock": false, "last_updated": "2024-01-01T00:00:00Z"
  }]
}
```

### POST /inventory/ `[Admin only]`
```json
{ "product": 1, "warehouse": 1, "quantity_available": 100, "quantity_reserved": 0 }
```
**Errors:** `400` qty negative · `400` reserved > available · `400` product+warehouse combo exists

### PUT/PATCH /inventory/{id}/ `[Admin only]`

### DELETE /inventory/{id}/ `[Admin only]`

---

## Stock Movements `[Admin: full | Operator: GET + complete assigned]`

### GET /stock-movements/
**Query params:** `search`, `movement_type`, `status`, `warehouse`, `assigned_operator`, `date_from`, `date_to`, `page`

Operators only see movements assigned to them.

### POST /stock-movements/ `[Admin only]`
```json
{
  "product": 1, "warehouse": 1,
  "movement_type": "stock_in",
  "quantity": 50,
  "assigned_operator": 2,
  "remarks": "Quarterly restock",
  "barcode_scanned": ""
}
```
**Movement types:** `stock_in` | `stock_out` | `adjustment`

**Errors:**
- `400` qty ≤ 0
- `400` stock_out qty > available - reserved
- `400` assigned user is not an operator
- `400` assigned operator is inactive

**Side effect:** stock_out creation increments `quantity_reserved` immediately.

### PUT/PATCH /stock-movements/{id}/ `[Assigned operator or Admin]`
Used to complete or cancel a movement.
```json
{
  "status": "completed",
  "remarks": "Done",
  "barcode_scanned": "123456789012"
}
```
**Status values:** `completed` | `cancelled`

**Side effects on `completed`:**
- `stock_in` → `quantity_available += quantity`
- `stock_out` → `quantity_reserved -= quantity`, `quantity_available -= quantity`
- `adjustment` → `quantity_available = quantity` (absolute)

**Side effects on `cancelled`:**
- `stock_out` → releases reservation (`quantity_reserved -= quantity`)

**Errors:**
- `403` if not the assigned operator (and not admin)
- `400` if movement is not in `pending` status
- `400` insufficient stock at completion time

---

## Categories `[Admin: full CRUD | Operator: GET]`

### GET /categories/
### POST /categories/ — `{ "name": "Electronics", "description": "" }`
### DELETE /categories/{id}/ — Fails with `400` if products are using this category

---

## Warehouses `[Admin: full CRUD | Operator: GET]`

### GET /warehouses/
### POST /warehouses/ — `{ "name": "Main Warehouse", "address": "123 Road" }`

---

## Common Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error — check `detail` or field-level errors |
| 401 | Missing or expired token |
| 403 | Insufficient role or not assigned operator |
| 404 | Record not found |
| 500 | Server error |

**Validation error shape:**
```json
{ "field_name": ["Error message here."], "non_field_errors": ["Cross-field error."] }
```
