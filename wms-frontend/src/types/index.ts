export interface AuthUser {
  id: number; name: string; email: string;
  role: 'admin' | 'operator'; status: 'active' | 'inactive';
}
export interface LoginCredentials { email: string; password: string; }
export interface AuthTokens { access: string; refresh: string; user: AuthUser; }
export interface Category { id: number; name: string; description: string; created_at: string; }
export interface Warehouse { id: number; name: string; address: string; created_at: string; updated_at: string; }
export interface Product {
  id: number; name: string; sku: string; category: number; category_name: string;
  unit_price: string; minimum_stock_level: number; status: 'active'|'inactive';
  description: string; barcode: string; inventory_records?: InventoryRecord[];
  created_at: string; updated_at: string;
}
export interface ProductFormData {
  name: string; sku: string; category: number|''; unit_price: string;
  minimum_stock_level: number; status: 'active'|'inactive'; description: string; barcode: string;
}
export interface InventoryRecord {
  id: number; product: number; product_name: string; product_sku: string;
  product_min_stock: number; product_status: 'active'|'inactive'; category_name: string;
  warehouse: number; warehouse_name: string; quantity_available: number;
  quantity_reserved: number; is_low_stock: boolean; last_updated: string; created_at: string;
}
export interface InventoryFormData { product: number|''; warehouse: number|''; quantity_available: number; quantity_reserved: number; }
export interface Operator {
  id: number; name: string; email: string; role: 'operator';
  status: 'active'|'inactive'; date_joined: string; last_login: string|null;
}
export interface OperatorFormData { name: string; email: string; password: string; status: 'active'|'inactive'; }
export type MovementType = 'stock_in'|'stock_out'|'adjustment';
export type MovementStatus = 'pending'|'completed'|'cancelled';
export interface StockMovement {
  id: number; product: number; product_name: string; product_sku: string;
  warehouse: number; warehouse_name: string; movement_type: MovementType;
  quantity: number; status: MovementStatus; assigned_operator: number|null;
  assigned_operator_name: string|null; created_by: number; created_by_name: string;
  completed_by: number|null; completed_by_name: string|null; remarks: string;
  barcode_scanned: string; completed_at: string|null; created_at: string; updated_at: string;
}
export interface StockMovementFormData {
  product: number|''; warehouse: number|''; movement_type: MovementType|'';
  quantity: number; assigned_operator: number|''; remarks: string; barcode_scanned: string;
}
export interface AdminDashboard {
  total_products: number; total_inventory_units: number; low_stock_items: number;
  active_operators: number; recent_movements: StockMovement[]; low_stock_list: InventoryRecord[];
}
export interface OperatorDashboard {
  products_received_today: number; products_issued_today: number;
  pending_stock_updates: number; low_stock_alerts: number; pending_movements: StockMovement[];
}
export interface PaginatedResponse<T> { count: number; next: string|null; previous: string|null; results: T[]; }
export interface ProductFilters { search?: string; category?: number|''; status?: string; low_stock?: boolean; page?: number; }
export interface InventoryFilters { search?: string; category?: number|''; warehouse?: number|''; product_status?: string; low_stock?: boolean; page?: number; }
export interface MovementFilters { search?: string; movement_type?: string; status?: string; warehouse?: number|''; assigned_operator?: number|''; date_from?: string; date_to?: string; page?: number; }
