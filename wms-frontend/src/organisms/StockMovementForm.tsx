import React, { useState } from 'react';
import { Select } from '../atoms/Select';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { TextArea } from '../atoms/TextArea';
import { BarcodeScanner } from '../molecules/BarcodeScanner';
import type { StockMovementFormData, Product, Warehouse, Operator } from '../types';

interface Props {
  products: Product[];
  warehouses: Warehouse[];
  operators: Operator[];
  onSubmit: (data: StockMovementFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const EMPTY: StockMovementFormData = {
  product: '', warehouse: '', movement_type: '', quantity: 1,
  assigned_operator: '', remarks: '', barcode_scanned: '',
};

export const StockMovementForm: React.FC<Props> = ({ products, warehouses, operators, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState<StockMovementFormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof StockMovementFormData, string>>>({});

  const set = (k: keyof StockMovementFormData, v: any) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
    // Auto-fill barcode if product is selected
    if (k === 'product' && v) {
      const prod = products.find(p => p.id === Number(v));
      if (prod?.barcode) setForm(f => ({ ...f, product: v, barcode_scanned: prod.barcode }));
    }
  };

  const validate = () => {
    const e: typeof errors = {};
    if (form.product === '') e.product = 'Product is required.';
    if (form.warehouse === '') e.warehouse = 'Warehouse is required.';
    if (form.movement_type === '') e.movement_type = 'Movement type is required.';
    if (!form.quantity || form.quantity <= 0) e.quantity = 'Quantity must be greater than zero.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit(form);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Select label="Product *" value={form.product} onChange={e => set('product', e.target.value)} error={errors.product as string}
        options={[{ value: '', label: 'Select product' }, ...products.filter(p => p.status === 'active').map(p => ({ value: p.id, label: `${p.name} (${p.sku})` }))]} />
      <Select label="Warehouse *" value={form.warehouse} onChange={e => set('warehouse', e.target.value)} error={errors.warehouse as string}
        options={[{ value: '', label: 'Select warehouse' }, ...warehouses.map(w => ({ value: w.id, label: w.name }))]} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Select label="Movement Type *" value={form.movement_type} onChange={e => set('movement_type', e.target.value)} error={errors.movement_type as string}
          options={[{ value: '', label: 'Select type' }, { value: 'stock_in', label: 'Stock In' }, { value: 'stock_out', label: 'Stock Out' }, { value: 'adjustment', label: 'Adjustment' }]} />
        <Input label="Quantity *" type="number" min="1" value={form.quantity} onChange={e => set('quantity', Number(e.target.value))} error={errors.quantity as string} />
      </div>
      <Select label="Assign Operator" value={form.assigned_operator} onChange={e => set('assigned_operator', e.target.value)}
        options={[{ value: '', label: 'Unassigned' }, ...operators.filter(o => o.status === 'active').map(o => ({ value: o.id, label: o.name }))]} />
      <BarcodeScanner value={form.barcode_scanned} onChange={v => set('barcode_scanned', v)} label="Barcode (optional)" />
      <TextArea label="Remarks" value={form.remarks} onChange={e => set('remarks', e.target.value)} placeholder="Optional notes about this movement…" />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} loading={loading}>Create Movement</Button>
      </div>
    </div>
  );
};
