import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { inventoryService, productService, warehouseService, categoryService } from '../services/wms.service';
import type { InventoryRecord, Product, Warehouse, Category, InventoryFilters } from '../types';
import { PageHeader } from '../molecules/PageHeader';
import { SearchBar } from '../molecules/SearchBar';
import { FilterPanel } from '../molecules/FilterPanel';
import { Modal } from '../molecules/Modal';
import { ConfirmDialog } from '../molecules/ConfirmDialog';
import { DataTable } from '../organisms/DataTable';
import type { Column } from '../organisms/DataTable';
import { InventoryForm } from '../organisms/InventoryForm';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils';
import { usePagination } from '../hooks/usePagination';
import toast from 'react-hot-toast';

export const InventoryPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { page, setPage, totalPages, reset } = usePagination();
  const [records, setRecords] = useState<InventoryRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<InventoryFilters>({});
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<InventoryRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryService.list({ ...filters, search: search || undefined, page });
      setRecords(res.results); setTotalCount(res.count);
    } finally { setLoading(false); }
  }, [filters, search, page]);

  useEffect(() => {
    Promise.all([
      productService.list({ page_size: 200 } as any).then(r => setProducts(r.results)),
      warehouseService.list().then(setWarehouses),
      categoryService.list().then(setCategories),
    ]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: any) => {
    setSaving(true);
    try {
      if (selected) { await inventoryService.update(selected.id, data); toast.success('Inventory updated.'); }
      else { await inventoryService.create(data); toast.success('Inventory record added.'); }
      setModal(null); setSelected(null); load();
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await inventoryService.delete(deleteTarget.id);
      toast.success('Inventory record removed.');
      setDeleteTarget(null); load();
    } finally { setDeleting(false); }
  };

  const columns: Column<InventoryRecord>[] = [
    { key: 'product_name', label: 'Product', render: r => (
      <div>
        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          {r.product_name}
          {r.is_low_stock && <AlertTriangle size={13} color="var(--warning-text)" aria-label="Low stock" />}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{r.product_sku}</div>
      </div>
    )},
    { key: 'category_name', label: 'Category', render: r => <Badge variant="info">{r.category_name}</Badge> },
    { key: 'warehouse_name', label: 'Location', render: r => <span style={{ fontSize: 13 }}>{r.warehouse_name}</span> },
    { key: 'quantity_available', label: 'Available', render: r => (
      <span style={{ fontWeight: 700, color: r.is_low_stock ? 'var(--danger-text)' : 'var(--success-text)' }}>
        {r.quantity_available}
      </span>
    ), align: 'center' },
    { key: 'quantity_reserved', label: 'Reserved', align: 'center' },
    { key: 'product_status', label: 'Status', render: r => <Badge variant={r.product_status === 'active' ? 'success' : 'default'}>{r.product_status}</Badge>, align: 'center' },
    { key: 'last_updated', label: 'Updated', render: r => <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDateTime(r.last_updated)}</span> },
    ...(isAdmin ? [{
      key: 'actions', label: '', render: (r: InventoryRecord) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" icon={<Edit2 size={13} />} onClick={() => { setSelected(r); setModal('edit'); }} />
          <Button variant="ghost" size="sm" icon={<Trash2 size={13} />} style={{ color: 'var(--danger-text)' }} onClick={() => setDeleteTarget(r)} />
        </div>
      ), align: 'right' as const,
    }] : []),
  ];

  return (
    <div>
      <PageHeader title="Inventory Overview" subtitle={`${totalCount} record${totalCount !== 1 ? 's' : ''}`}
        actions={isAdmin ? <Button variant="primary" icon={<Plus size={15} />} onClick={() => { setSelected(null); setModal('create'); }}>Add Inventory</Button> : undefined} />
      <Card>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', position: 'relative' }}>
          <SearchBar value={search} onChange={v => { setSearch(v); reset(); }} placeholder="Search product, SKU, warehouse…" />
          <FilterPanel
            fields={[
              { key: 'category', label: 'Category', type: 'select', options: categories.map(c => ({ value: c.id, label: c.name })) },
              { key: 'warehouse', label: 'Warehouse', type: 'select', options: warehouses.map(w => ({ value: w.id, label: w.name })) },
              { key: 'product_status', label: 'Product Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
              { key: 'low_stock', label: 'Low Stock Only', type: 'select', options: [{ value: 'true', label: 'Yes' }] },
            ]}
            values={filters} onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); reset(); }}
            onReset={() => { setFilters({}); reset(); }} />
        </div>
        <DataTable columns={columns} data={records} loading={loading}
          emptyTitle="No inventory records" emptyDescription="Add inventory to get started."
          page={page} totalPages={totalPages(totalCount)} totalCount={totalCount} pageSize={20}
          onPageChange={setPage} rowKey={r => r.id} />
      </Card>

      <Modal open={!!modal} onClose={() => { setModal(null); setSelected(null); }}
        title={modal === 'create' ? 'Add Inventory' : 'Edit Inventory'} width={480}>
        <InventoryForm initial={modal === 'edit' ? selected! : undefined} products={products} warehouses={warehouses}
          onSubmit={handleSave} onCancel={() => { setModal(null); setSelected(null); }} loading={saving} />
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Remove Inventory Record"
        message={`Remove inventory of "${deleteTarget?.product_name}" from ${deleteTarget?.warehouse_name}? This cannot be undone.`}
        confirmLabel="Remove" loading={deleting} />
    </div>
  );
};
