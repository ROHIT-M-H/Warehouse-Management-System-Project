import React, { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { warehouseService } from '../services/wms.service';
import type { Warehouse } from '../types';
import { PageHeader } from '../molecules/PageHeader';
import { Modal } from '../molecules/Modal';
import { DataTable } from '../organisms/DataTable';
import type { Column } from '../organisms/DataTable';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { Input } from '../atoms/Input';
import { TextArea } from '../atoms/TextArea';
import { formatDate } from '../utils';
import toast from 'react-hot-toast';

export const WarehousesPage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try { setWarehouses(await warehouseService.list()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      await warehouseService.create(form);
      toast.success('Warehouse added.');
      setModal(false); setForm({ name: '', address: '' }); load();
    } finally { setSaving(false); }
  };

  const columns: Column<Warehouse>[] = [
    { key: 'name', label: 'Warehouse Name', render: w => <span style={{ fontWeight: 600 }}>{w.name}</span> },
    { key: 'address', label: 'Address', render: w => <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{w.address || '—'}</span> },
    { key: 'created_at', label: 'Created', render: w => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(w.created_at)}</span> },
  ];

  return (
    <div>
      <PageHeader title="Warehouses" subtitle={`${warehouses.length} location${warehouses.length !== 1 ? 's' : ''}`}
        actions={<Button variant="primary" icon={<Plus size={15} />} onClick={() => setModal(true)}>Add Warehouse</Button>} />
      <Card>
        <DataTable columns={columns} data={warehouses} loading={loading} emptyTitle="No warehouses yet" rowKey={w => w.id} />
      </Card>
      <Modal open={modal} onClose={() => setModal(false)} title="Add Warehouse" width={420}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Warehouse Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} error={errors.name} placeholder="e.g. Main Warehouse" />
          <TextArea label="Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Street, Zone, City" />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>Add Warehouse</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
