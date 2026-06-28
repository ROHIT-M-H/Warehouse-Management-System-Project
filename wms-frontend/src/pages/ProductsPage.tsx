import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { productService, categoryService } from '../services/wms.service';
import type { Product, Category, ProductFilters } from '../types';
import { PageHeader } from '../molecules/PageHeader';
import { SearchBar } from '../molecules/SearchBar';
import { FilterPanel } from '../molecules/FilterPanel';
import { Modal } from '../molecules/Modal';
import { ConfirmDialog } from '../molecules/ConfirmDialog';
import { DataTable } from '../organisms/DataTable';
import type { Column } from '../organisms/DataTable';
import { ProductForm } from '../organisms/ProductForm';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils';
import { usePagination } from '../hooks/usePagination';
import toast from 'react-hot-toast';

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { page, setPage, totalPages, reset } = usePagination();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.list({ ...filters, search: search || undefined, page });
      setProducts(res.results);
      setTotalCount(res.count);
    } finally { setLoading(false); }
  }, [filters, search, page]);

  useEffect(() => { categoryService.list().then(setCategories); }, []);
  useEffect(() => { load(); }, [load]);

  const handleSearch = (v: string) => { setSearch(v); reset(); };
  const handleFilter = (k: string, v: any) => { setFilters(f => ({ ...f, [k]: v })); reset(); };
  const handleResetFilters = () => { setFilters({}); reset(); };

  const handleSave = async (data: any) => {
    setSaving(true);
    try {
      if (selected) {
        await productService.update(selected.id, data);
        toast.success('Product updated.');
      } else {
        await productService.create(data);
        toast.success('Product created.');
      }
      setModal(null); setSelected(null); load();
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productService.delete(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deactivated.`);
      setDeleteTarget(null); load();
    } finally { setDeleting(false); }
  };

  const columns: Column<Product>[] = [
    { key: 'name', label: 'Product', render: p => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{p.sku}</div>
      </div>
    )},
    { key: 'category_name', label: 'Category', render: p => <Badge variant="info">{p.category_name}</Badge> },
    { key: 'unit_price', label: 'Unit Price', render: p => formatCurrency(p.unit_price), align: 'right' },
    { key: 'minimum_stock_level', label: 'Min Stock', align: 'center' },
    { key: 'status', label: 'Status', render: p => <Badge variant={p.status === 'active' ? 'success' : 'default'}>{p.status}</Badge>, align: 'center' },
    { key: 'created_at', label: 'Created', render: p => <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{formatDate(p.created_at)}</span> },
    { key: 'actions', label: '', render: p => (
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <Button variant="ghost" size="sm" icon={<Eye size={13} />} onClick={() => { setSelected(p); setModal('view'); }} />
        {isAdmin && <Button variant="ghost" size="sm" icon={<Edit2 size={13} />} onClick={() => { setSelected(p); setModal('edit'); }} />}
        {isAdmin && <Button variant="ghost" size="sm" icon={<Trash2 size={13} />} style={{ color: 'var(--danger-text)' }} onClick={() => setDeleteTarget(p)} />}
      </div>
    ), align: 'right' },
  ];

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${totalCount} product${totalCount !== 1 ? 's' : ''} total`}
        actions={isAdmin ? <Button variant="primary" icon={<Plus size={15} />} onClick={() => { setSelected(null); setModal('create'); }}>New Product</Button> : undefined}
      />

      <Card>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', position: 'relative' }}>
          <SearchBar value={search} onChange={handleSearch} placeholder="Search by name, SKU, category…" />
          <FilterPanel
            fields={[
              { key: 'category', label: 'Category', type: 'select', options: categories.map(c => ({ value: c.id, label: c.name })) },
              { key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
            ]}
            values={filters}
            onChange={handleFilter}
            onReset={handleResetFilters}
          />
        </div>

        <DataTable
          columns={columns} data={products} loading={loading}
          emptyTitle="No products found"
          emptyDescription="Try adjusting your search or filters."
          page={page} totalPages={totalPages(totalCount)} totalCount={totalCount} pageSize={20}
          onPageChange={setPage}
          rowKey={p => p.id}
        />
      </Card>

      <Modal open={modal === 'create' || modal === 'edit'} onClose={() => { setModal(null); setSelected(null); }}
        title={modal === 'create' ? 'New Product' : 'Edit Product'} width={560}>
        <ProductForm initial={modal === 'edit' ? selected! : undefined} categories={categories}
          onSubmit={handleSave} onCancel={() => { setModal(null); setSelected(null); }} loading={saving} />
      </Modal>

      <Modal open={modal === 'view'} onClose={() => { setModal(null); setSelected(null); }} title="Product Details" width={480}>
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['Name', selected.name], ['SKU', selected.sku], ['Category', selected.category_name],
              ['Unit Price', formatCurrency(selected.unit_price)],
              ['Min Stock', selected.minimum_stock_level],
              ['Status', selected.status], ['Barcode', selected.barcode || '—'],
              ['Description', selected.description || '—'],
            ].map(([k, v]) => (
              <div key={String(k)} style={{ display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 120, flexShrink: 0 }}>{k}</span>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Deactivate Product"
        message={`"${deleteTarget?.name}" will be marked inactive. Its inventory history will be preserved.`}
        confirmLabel="Deactivate" loading={deleting}
      />
    </div>
  );
};
