import React, { useRef, useState } from 'react';
import { Barcode } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}

export const BarcodeScanner: React.FC<Props> = ({ value, onChange, label = 'Barcode' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);

  const handleScanClick = () => {
    setScanning(true);
    inputRef.current?.focus();
    setTimeout(() => setScanning(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', left: 10, color: 'var(--text-muted)', display: 'flex' }}>
            <Barcode size={15} />
          </span>
          <input
            ref={inputRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={scanning ? '🔴 Scan barcode now…' : 'Enter or scan barcode'}
            style={{
              width: '100%', padding: '8px 12px', paddingLeft: 34,
              background: 'var(--bg-card)', border: `1px solid ${scanning ? 'var(--brand-500)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)', color: 'var(--text-primary)', outline: 'none', fontSize: 14,
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleScanClick}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 'var(--radius)', fontSize: 13,
            background: scanning ? 'var(--brand-600)' : 'var(--bg-card)',
            color: scanning ? '#fff' : 'var(--text-secondary)',
            border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 500,
          }}
        >
          <Barcode size={15} /> Scan
        </button>
      </div>
      {scanning && <span style={{ fontSize: 12, color: 'var(--brand-600)' }}>Barcode field active — scan now</span>}
    </div>
  );
};
