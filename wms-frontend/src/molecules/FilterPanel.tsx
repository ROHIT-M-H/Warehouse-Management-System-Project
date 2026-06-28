import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Select } from '../atoms/Select';
import { Input } from '../atoms/Input';

interface FilterField {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date';
  options?: { value: string | number; label: string }[];
}

interface Props {
  fields: FilterField[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onReset: () => void;
}

export const FilterPanel: React.FC<Props> = ({ fields, values, onChange, onReset }) => {
  const [open, setOpen] = useState(false);
  const activeCount = Object.values(values).filter(v => v !== '' && v !== undefined).length;

  return (
    <div>
      <Button
        variant="secondary" size="md"
        onClick={() => setOpen(o => !o)}
        icon={<Filter size={14} />}
        style={{ position: 'relative' }}
      >
        Filters
        {activeCount > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -6, width: 16, height: 16,
            background: 'var(--brand-600)', color: '#fff', borderRadius: '50%',
            fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
          }}>{activeCount}</span>
        )}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </Button>

      {open && (
        <div style={{
          position: 'absolute', zIndex: 100, marginTop: 6,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: 16,
          boxShadow: 'var(--shadow-md)', minWidth: 280,
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12,
        }}>
          {fields.map(f => (
            <div key={f.key}>
              {f.type === 'select' && f.options && (
                <Select
                  label={f.label}
                  value={values[f.key] ?? ''}
                  onChange={e => onChange(f.key, e.target.value)}
                  options={[{ value: '', label: `All ${f.label}` }, ...f.options]}
                />
              )}
              {(f.type === 'text' || f.type === 'date') && (
                <Input
                  label={f.label}
                  type={f.type === 'date' ? 'date' : 'text'}
                  value={values[f.key] ?? ''}
                  onChange={e => onChange(f.key, e.target.value)}
                />
              )}
            </div>
          ))}
          <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="ghost" size="sm" icon={<X size={13} />} onClick={() => { onReset(); setOpen(false); }}>
              Reset
            </Button>
            <Button variant="primary" size="sm" onClick={() => setOpen(false)}>Apply</Button>
          </div>
        </div>
      )}
    </div>
  );
};
