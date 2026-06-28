import React, { useState, useEffect } from 'react';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Button } from '../atoms/Button';
import { TextArea } from '../atoms/TextArea';
import { BarcodeScanner } from '../molecules/BarcodeScanner';
import type { Product, ProductFormData, Category } from '../types';

interface Props {
  initial?: Product;
  categories: Category[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const EMPTY: ProductFormData = {
  name: '', sku: '', category: '', unit_price: '',
  minimum_stock_level: 0, status: 'active', description: '', barcode: '',
};

export const ProductForm: React.FC<Props> = ({ initial, categories, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState<ProductFormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name, sku: initial.sku, category: initial.category,
        unit_price: initial.unit_price, minimum_stock_level: initial.minimum_stock_level,
        status: initial.status, description: initial.description, barcode: initial.barcode,
      });
    }
  }, [initial]);

  const set = (k: keyof ProductFormData, v: any) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Product name is required.';
    if (!form.sku.trim()) e.sku = 'SKU is required.';
    if (form.category === '') e.category = 'Category is required.';
    if (!form.unit_price || isNaN(Number(form.unit_price)) || Number(form.unit_price) < 0)
      e.unit_price = 'Enter a valid non-negative price.';
    if (form.minimum_stock_level < 0) e.minimum_stock_level = 'Cannot be negative.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit(form);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <Input label="Product Name *" value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} placeholder="e.g. USB-C Hub 7-Port" />
        </div>
        <Input label="SKU *" value={form.sku} onChange={e => set('sku', e.target.value.toUpperCase())} error={errors.sku} placeholder="e.g. ELEC-001" />
        <Select
          label="Category *"
          value={form.category}
          onChange={e => set('category', Number(e.target.value))}
          error={errors.category as string}
          options={[{ value: '', label: 'Select category' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
        />
        <Input label="Unit Price (₹) *" type="number" min="0" step="0.01" value={form.unit_price} onChange={e => set('unit_price', e.target.value)} error={errors.unit_price} placeholder="0.00" />
        <Input label="Minimum Stock Level" type="number" min="0" value={form.minimum_stock_level} onChange={e => set('minimum_stock_level', Number(e.target.value))} error={errors.minimum_stock_level as string} />
        <Select
          label="Status"
          value={form.status}
          onChange={e => set('status', e.target.value as 'active' | 'inactive')}
          options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
        />
        <div style={{ gridColumn: '1/-1' }}>
          <BarcodeScanner value={form.barcode} onChange={v => set('barcode', v)} />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <TextArea label="Description" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional product description…" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} loading={loading}>
          {initial ? 'Save Changes' : 'Create Product'}
        </Button>
      </div>
    </div>
  );
};
