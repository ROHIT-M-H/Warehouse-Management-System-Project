import api from './api';
import type {
  Product, ProductFormData, PaginatedResponse, ProductFilters,
  InventoryRecord, InventoryFormData, InventoryFilters,
  Operator, OperatorFormData, StockMovement, StockMovementFormData,
  MovementFilters, Category, Warehouse, AdminDashboard, OperatorDashboard,
} from '../types';

const toParams = (obj: Record<string, any>) => {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) p.append(k, String(v));
  });
  return p;
};

export const getDashboard = {
  admin: () => api.get<AdminDashboard>('/dashboard/admin/').then(r => r.data),
  operator: () => api.get<OperatorDashboard>('/dashboard/operator/').then(r => r.data),
};

export const categoryService = {
  list: () => api.get<PaginatedResponse<Category>>('/categories/?page_size=100').then(r => r.data.results),
  create: (d: Partial<Category>) => api.post<Category>('/categories/', d).then(r => r.data),
  delete: (id: number) => api.delete(`/categories/${id}/`),
};

export const warehouseService = {
  list: () => api.get<PaginatedResponse<Warehouse>>('/warehouses/?page_size=100').then(r => r.data.results),
  create: (d: Partial<Warehouse>) => api.post<Warehouse>('/warehouses/', d).then(r => r.data),
};

export const productService = {
  list: (f: ProductFilters = {}) => api.get<PaginatedResponse<Product>>(`/products/?${toParams(f as any)}`).then(r => r.data),
  get: (id: number) => api.get<Product>(`/products/${id}/`).then(r => r.data),
  create: (d: ProductFormData) => api.post<Product>('/products/', d).then(r => r.data),
  update: (id: number, d: Partial<ProductFormData>) => api.patch<Product>(`/products/${id}/`, d).then(r => r.data),
  delete: (id: number) => api.delete(`/products/${id}/`),
};

export const operatorService = {
  list: (params: Record<string, any> = {}) => api.get<PaginatedResponse<Operator>>(`/operators/?${toParams(params)}`).then(r => r.data),
  get: (id: number) => api.get<Operator>(`/operators/${id}/`).then(r => r.data),
  create: (d: OperatorFormData) => api.post<Operator>('/operators/', d).then(r => r.data),
  update: (id: number, d: Partial<OperatorFormData>) => api.patch<Operator>(`/operators/${id}/`, d).then(r => r.data),
};

export const inventoryService = {
  list: (f: InventoryFilters = {}) => api.get<PaginatedResponse<InventoryRecord>>(`/inventory/?${toParams(f as any)}`).then(r => r.data),
  get: (id: number) => api.get<InventoryRecord>(`/inventory/${id}/`).then(r => r.data),
  create: (d: InventoryFormData) => api.post<InventoryRecord>('/inventory/', d).then(r => r.data),
  update: (id: number, d: Partial<InventoryFormData>) => api.patch<InventoryRecord>(`/inventory/${id}/`, d).then(r => r.data),
  delete: (id: number) => api.delete(`/inventory/${id}/`),
};

export const movementService = {
  list: (f: MovementFilters = {}) => api.get<PaginatedResponse<StockMovement>>(`/stock-movements/?${toParams(f as any)}`).then(r => r.data),
  get: (id: number) => api.get<StockMovement>(`/stock-movements/${id}/`).then(r => r.data),
  create: (d: StockMovementFormData) => api.post<StockMovement>('/stock-movements/', d).then(r => r.data),
  complete: (id: number, d: { status: 'completed'|'cancelled'; remarks?: string; barcode_scanned?: string }) =>
    api.patch<StockMovement>(`/stock-movements/${id}/`, d).then(r => r.data),
};
