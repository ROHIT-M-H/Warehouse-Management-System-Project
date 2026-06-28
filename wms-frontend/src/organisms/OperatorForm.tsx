import React, { useState, useEffect } from 'react';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Button } from '../atoms/Button';
import type { Operator, OperatorFormData } from '../types';

interface Props {
  initial?: Operator;
  onSubmit: (data: OperatorFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const EMPTY: OperatorFormData = { name: '', email: '', password: '', status: 'active' };

export const OperatorForm: React.FC<Props> = ({ initial, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState<OperatorFormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof OperatorFormData, string>>>({});
  const isEdit = !!initial;

  useEffect(() => {
    if (initial) setForm({ name: initial.name, email: initial.email, password: '', status: initial.status });
  }, [initial]);

  const set = (k: keyof OperatorFormData, v: any) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email is required.';
    if (!isEdit && form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload: any = { name: form.name, status: form.status };
    if (!isEdit) { payload.email = form.email; payload.password = form.password; }
    await onSubmit(payload);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Input label="Full Name *" value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} placeholder="e.g. Bob Operator" />
      <Input label="Email Address *" type="email" value={form.email} onChange={e => set('email', e.target.value)} error={errors.email} disabled={isEdit} placeholder="operator@company.com" />
      {!isEdit && <Input label="Password *" type="password" value={form.password} onChange={e => set('password', e.target.value)} error={errors.password} hint="Minimum 8 characters" />}
      <Select
        label="Status"
        value={form.status}
        onChange={e => set('status', e.target.value as 'active' | 'inactive')}
        options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
      />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} loading={loading}>
          {isEdit ? 'Save Changes' : 'Create Operator'}
        </Button>
      </div>
    </div>
  );
};
