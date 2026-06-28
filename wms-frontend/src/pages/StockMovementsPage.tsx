import React, { useEffect, useState, useCallback } from 'react';
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import { movementService, productService, warehouseService, operatorService } from '../services/wms.service';
import type { StockMovement, Product, Warehouse, Operator, MovementFilters } from '../types';
import { PageHeader } from '../molecules/PageHeader';
import { SearchBar } from '../molecules/SearchBar';
import { FilterPanel } from '../molecules/FilterPanel';
import { Modal } from '../molecules/Modal';
import { DataTable } from '../organisms/DataTable';
import type { Column } from '../organisms/DataTable';
import { StockMovementForm } from '../organisms/StockMovementForm';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { TextArea } from '../atoms/TextArea';
import { BarcodeScanner } from '../molecules/BarcodeScanner';
import { useAuth } from '../context/AuthContext';
import { formatDateTime, movementTypeLabel, statusBadge, movementTypeBadge } from '../utils';
import { usePagination } from '../hooks/usePagination';
import toast from 'react-hot-toast';

export const StockMovementsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { page, setPage, totalPages, reset } = usePagination();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MovementFilters>({});
  const [search, setSearch] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [completeTarget, setCompleteTarget] = useState<StockMovement | null>(null);
  const [completeRemarks, setCompleteRemarks] = useState('');
  const [completeBarcode, setCompleteBarcode] = useState('');
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await movementService.list({ ...filters, search: search || undefined, page });
      setMovements(res.results); setTotalCount(res.count);
    } finally { setLoading(false); }
  }, [filters, search, page]);

  useEffect(() => {
    if (isAdmin) {
      Promise.all([
        productService.list({ page_size: 200 } as any).then(r => setProducts(r.results)),
        warehouseService.list().then(setWarehouses),
        operatorService.list({ page_size: 100 }).then(r => setOperators(r.results)),
      ]);
    }
  }, [isAdmin]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data: any) => {
    setSaving(true);
    try {
      await movementService.create(data);
      toast.success('Stock movement created.');
      setCreateModal(false); load();
    } finally { setSaving(false); }
  };

  const handleComplete = async (status: 'completed' | 'cancelled') => {
    if (!completeTarget) return;
    setCompleting(true);
    try {
      await movementService.complete(completeTarget.id, { status, remarks: completeRemarks, barcode_scanned: completeBarcode });
      toast.success(`Movement ${status}.`);
      setCompleteTarget(null); setCompleteRemarks(''); setCompleteBarcode(''); load();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.non_field_errors?.[0] || 'Failed.';
      toast.error(msg);
    } finally { setCompleting(false); }
  };

  const canComplete = (m: StockMovement) =>
    m.status === 'pending' && (isAdmin || m.assigned_operator === user?.id);

  const columns: Column<StockMovement>[] = [
    { key: 'id', label: '#', render: m => <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>#{m.id}</span>, width: 50 },
    { key: 'product_name', label: 'Product', render: m => (
      <div>
        <div style={{ fontWeight: 600 }}>{m.product_name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{m.product_sku}</div>
      </div>
    )},
    { key: 'movement_type', label: 'Type', render: m => <Badge variant={movementTypeBadge(m.movement_type)}>{movementTypeLabel[m.movement_type]}</Badge> },
    { key: 'quantity', label: 'Qty', align: 'center', render: m => <span style={{ fontWeight: 600 }}>{m.quantity}</span> },
    { key: 'warehouse_name', label: 'Warehouse', render: m => <span style={{ fontSize: 13 }}>{m.warehouse_name}</span> },
    { key: 'assigned_operator_name', label: 'Operator', render: m => <span style={{ fontSize: 13, color: m.assigned_operator_name ? 'var(--text-primary)' : 'var(--text-muted)' }}>{m.assigned_operator_name || 'Unassigned'}</span> },
    { key: 'status', label: 'Status', render: m => <Badge variant={statusBadge(m.status)}>{m.status}</Badge>, align: 'center' },
    { key: 'created_at', label: 'Created', render: m => <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDateTime(m.created_at)}</span> },
    { key: 'actions', label: '', render: m => (
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        {canComplete(m) && (
          <>
            <Button variant="success" size="sm" icon={<CheckCircle size={13} />} onClick={() => { setCompleteTarget(m); setCompleteBarcode(m.barcode_scanned || ''); }}>Complete</Button>
          </>
        )}
      </div>
    ), align: 'right' },
  ];

  return (
    <div>
      <PageHeader title="Stock Movements" subtitle={`${totalCount} movement${totalCount !== 1 ? 's' : ''}`}
        actions={isAdmin ? <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreateModal(true)}>New Movement</Button> : undefined} />

      <Card>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', position: 'relative' }}>
          <SearchBar value={search} onChange={v => { setSearch(v); reset(); }} placeholder="Search product, SKU, operator…" />
          <FilterPanel
            fields={[
              { key: 'movement_type', label: 'Type', type: 'select', options: [{ value: 'stock_in', label: 'Stock In' }, { value: 'stock_out', label: 'Stock Out' }, { value: 'adjustment', label: 'Adjustment' }] },
              { key: 'status', label: 'Status', type: 'select', options: [{ value: 'pending', label: 'Pending' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }] },
              { key: 'warehouse', label: 'Warehouse', type: 'select', options: warehouses.map(w => ({ value: w.id, label: w.name })) },
              { key: 'date_from', label: 'From Date', type: 'date' },
              { key: 'date_to', label: 'To Date', type: 'date' },
            ]}
            values={filters} onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); reset(); }}
            onReset={() => { setFilters({}); reset(); }} />
        </div>
        <DataTable columns={columns} data={movements} loading={loading}
          emptyTitle="No movements found" emptyDescription={isAdmin ? "Create your first stock movement." : "No movements assigned to you."}
          page={page} totalPages={totalPages(totalCount)} totalCount={totalCount} pageSize={20}
          onPageChange={setPage} rowKey={m => m.id} />
      </Card>

      {/* Create modal (admin only) */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="New Stock Movement" width={560}>
        <StockMovementForm products={products} warehouses={warehouses} operators={operators}
          onSubmit={handleCreate} onCancel={() => setCreateModal(false)} loading={saving} />
      </Modal>

      {/* Complete/Cancel modal */}
      <Modal open={!!completeTarget} onClose={() => { setCompleteTarget(null); setCompleteRemarks(''); }} title="Complete Movement" width={460}>
        {completeTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: 12, background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', fontSize: 13 }}>
              <div><strong>{movementTypeLabel[completeTarget.movement_type]}</strong> — {completeTarget.product_name}</div>
              <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>Qty: {completeTarget.quantity} · {completeTarget.warehouse_name}</div>
            </div>
            <BarcodeScanner value={completeBarcode} onChange={setCompleteBarcode} label="Scan to confirm (optional)" />
            <TextArea label="Completion Remarks" value={completeRemarks} onChange={e => setCompleteRemarks(e.target.value)} placeholder="Optional notes…" />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setCompleteTarget(null)} disabled={completing}>Cancel</Button>
              <Button variant="danger" icon={<XCircle size={14} />} onClick={() => handleComplete('cancelled')} loading={completing}>Cancel Movement</Button>
              <Button variant="success" icon={<CheckCircle size={14} />} onClick={() => handleComplete('completed')} loading={completing}>Mark Complete</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
