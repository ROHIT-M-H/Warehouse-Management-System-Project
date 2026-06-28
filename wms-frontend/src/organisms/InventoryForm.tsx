import React, { useState, useEffect } from 'react';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Button } from '../atoms/Button';
import type { InventoryRecord, InventoryFormData, Product, Warehouse } from '../types';

interface Props {
  initial?: InventoryRecord;
  products: Product[];
  warehouses: Warehouse[];
  onSubmit: (data: InventoryFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const EMPTY: InventoryFormData = { product: '', warehouse: '', quantity_available: 0, quantity_reserved: 0 };

export const InventoryForm: React.FC<Props> = ({ initial, products, warehouses, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState<InventoryFormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof InventoryFormData, string>>>({});

  useEffect(() => {
    if (initial) setForm({ product: initial.product, warehouse: initial.warehouse, quantity_available: initial.quantity_available, quantity_reserved: initial.quantity_reserved });
  }, [initial]);

  const set = (k: keyof InventoryFormData, v: any) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (form.product === '') e.product = 'Product is required.';
    if (form.warehouse === '') e.warehouse = 'Warehouse is required.';
    if (form.quantity_available < 0) e.quantity_available = 'Cannot be negative.';
    if (form.quantity_reserved < 0) e.quantity_reserved = 'Cannot be negative.';
    if (form.quantity_reserved > form.quantity_available) e.quantity_reserved = 'Reserved cannot exceed available.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit(form);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Select label="Product *" value={form.product} onChange={e => set('product', Number(e.target.value))} error={errors.product as string} disabled={!!initial}
        options={[{ value: '', label: 'Select product' }, ...products.filter(p => p.status === 'active').map(p => ({ value: p.id, label: `${p.name} (${p.sku})` }))]} />
      <Select label="Warehouse *" value={form.warehouse} onChange={e => set('warehouse', Number(e.target.value))} error={errors.warehouse as string} disabled={!!initial}
        options={[{ value: '', label: 'Select warehouse' }, ...warehouses.map(w => ({ value: w.id, label: w.name }))]} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Quantity Available *" type="number" min="0" value={form.quantity_available} onChange={e => set('quantity_available', Number(e.target.value))} error={errors.quantity_available as string} />
        <Input label="Quantity Reserved" type="number" min="0" value={form.quantity_reserved} onChange={e => set('quantity_reserved', Number(e.target.value))} error={errors.quantity_reserved as string} />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} loading={loading}>
          {initial ? 'Save Changes' : 'Add Inventory'}
        </Button>
      </div>
    </div>
  );
};
