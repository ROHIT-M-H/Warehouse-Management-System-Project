import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, UserCheck, UserX } from 'lucide-react';
import { operatorService } from '../services/wms.service';
import type { Operator } from '../types';
import { PageHeader } from '../molecules/PageHeader';
import { SearchBar } from '../molecules/SearchBar';
import { FilterPanel } from '../molecules/FilterPanel';
import { Modal } from '../molecules/Modal';
import { DataTable } from '../organisms/DataTable';
import type { Column } from '../organisms/DataTable';
import { OperatorForm } from '../organisms/OperatorForm';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { formatDate, formatDateTime } from '../utils';
import { usePagination } from '../hooks/usePagination';
import toast from 'react-hot-toast';

export const OperatorsPage: React.FC = () => {
  const { page, setPage, totalPages, reset } = usePagination();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Operator | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await operatorService.list({ search: search || undefined, status: statusFilter || undefined, page });
      setOperators(res.results);
      setTotalCount(res.count);
    } finally { setLoading(false); }
  }, [search, statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: any) => {
    setSaving(true);
    try {
      if (selected) { await operatorService.update(selected.id, data); toast.success('Operator updated.'); }
      else { await operatorService.create(data); toast.success('Operator created.'); }
      setModal(null); setSelected(null); load();
    } finally { setSaving(false); }
  };

  const toggleStatus = async (op: Operator) => {
    const newStatus = op.status === 'active' ? 'inactive' : 'active';
    try {
      await operatorService.update(op.id, { status: newStatus } as any);
      toast.success(`${op.name} ${newStatus === 'active' ? 'activated' : 'deactivated'}.`);
      load();
    } catch { toast.error('Failed to update status.'); }
  };

  const columns: Column<Operator>[] = [
    { key: 'name', label: 'Operator', render: o => (
      <div>
        <div style={{ fontWeight: 600 }}>{o.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.email}</div>
      </div>
    )},
    { key: 'status', label: 'Status', render: o => <Badge variant={o.status === 'active' ? 'success' : 'default'} dot>{o.status}</Badge>, align: 'center' },
    { key: 'date_joined', label: 'Joined', render: o => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(o.date_joined)}</span> },
    { key: 'last_login', label: 'Last Login', render: o => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{o.last_login ? formatDateTime(o.last_login) : 'Never'}</span> },
    { key: 'actions', label: '', render: o => (
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <Button variant="ghost" size="sm" icon={<Edit2 size={13} />} onClick={() => { setSelected(o); setModal('edit'); }} />
        <Button variant={o.status === 'active' ? 'ghost' : 'success'} size="sm"
          icon={o.status === 'active' ? <UserX size={13} /> : <UserCheck size={13} />}
          style={{ color: o.status === 'active' ? 'var(--warning-text)' : 'var(--success-text)' }}
          onClick={() => toggleStatus(o)} title={o.status === 'active' ? 'Deactivate' : 'Activate'} />
      </div>
    ), align: 'right' },
  ];

  return (
    <div>
      <PageHeader title="Warehouse Operators" subtitle={`${totalCount} operator${totalCount !== 1 ? 's' : ''}`}
        actions={<Button variant="primary" icon={<Plus size={15} />} onClick={() => { setSelected(null); setModal('create'); }}>New Operator</Button>} />
      <Card>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', position: 'relative' }}>
          <SearchBar value={search} onChange={v => { setSearch(v); reset(); }} placeholder="Search by name or email…" />
          <FilterPanel
            fields={[{ key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] }]}
            values={{ status: statusFilter }}
            onChange={(_k, v) => { setStatusFilter(v); reset(); }}
            onReset={() => { setStatusFilter(''); reset(); }}
          />
        </div>
        <DataTable columns={columns} data={operators} loading={loading} emptyTitle="No operators found"
          page={page} totalPages={totalPages(totalCount)} totalCount={totalCount} pageSize={20}
          onPageChange={setPage} rowKey={o => o.id} />
      </Card>
      <Modal open={!!modal} onClose={() => { setModal(null); setSelected(null); }}
        title={modal === 'create' ? 'New Operator' : 'Edit Operator'} width={440}>
        <OperatorForm initial={modal === 'edit' ? selected! : undefined}
          onSubmit={handleSave} onCancel={() => { setModal(null); setSelected(null); }} loading={saving} />
      </Modal>
    </div>
  );
};
