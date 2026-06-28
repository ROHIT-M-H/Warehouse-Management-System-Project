import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { categoryService } from '../services/wms.service';
import type { Category } from '../types';
import { PageHeader } from '../molecules/PageHeader';
import { ConfirmDialog } from '../molecules/ConfirmDialog';
import { Modal } from '../molecules/Modal';
import { DataTable } from '../organisms/DataTable';
import type { Column } from '../organisms/DataTable';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { Input } from '../atoms/Input';
import { TextArea } from '../atoms/TextArea';
import { formatDate } from '../utils';
import toast from 'react-hot-toast';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try { setCategories(await categoryService.list()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      await categoryService.create(form);
      toast.success('Category created.');
      setModal(false); setForm({ name: '', description: '' }); load();
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await categoryService.delete(deleteTarget.id);
      toast.success('Category deleted.');
      setDeleteTarget(null); load();
    } catch { toast.error('Cannot delete — products are using this category.'); setDeleteTarget(null); }
    finally { setDeleting(false); }
  };

  const columns: Column<Category>[] = [
    { key: 'name', label: 'Category Name', render: c => <span style={{ fontWeight: 600 }}>{c.name}</span> },
    { key: 'description', label: 'Description', render: c => <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.description || '—'}</span> },
    { key: 'created_at', label: 'Created', render: c => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(c.created_at)}</span> },
    { key: 'actions', label: '', render: c => (
      <Button variant="ghost" size="sm" icon={<Trash2 size={13} />} style={{ color: 'var(--danger-text)' }} onClick={() => setDeleteTarget(c)} />
    ), align: 'right' },
  ];

  return (
    <div>
      <PageHeader title="Categories" subtitle={`${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`}
        actions={<Button variant="primary" icon={<Plus size={15} />} onClick={() => setModal(true)}>New Category</Button>} />
      <Card>
        <DataTable columns={columns} data={categories} loading={loading} emptyTitle="No categories yet" rowKey={c => c.id} />
      </Card>
      <Modal open={modal} onClose={() => setModal(false)} title="New Category" width={400}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Category Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} error={errors.name} placeholder="e.g. Electronics" />
          <TextArea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description…" />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>Create</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Category" message={`Delete "${deleteTarget?.name}"? This will fail if any products are using it.`}
        confirmLabel="Delete" loading={deleting} />
    </div>
  );
};
