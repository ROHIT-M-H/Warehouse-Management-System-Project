import React from 'react';

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; error?: string; options: { value: string|number; label: string }[];
}

export const Select: React.FC<Props> = ({ label, error, options, id, ...rest }) => {
  const selectId = id || `select-${Math.random().toString(36).slice(2)}`;
  return (
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      {label && <label htmlFor={selectId} style={{fontSize:13,fontWeight:500,color:'var(--text-secondary)'}}>{label}</label>}
      <select
        id={selectId}
        style={{
          width:'100%', padding:'8px 12px',
          background:'var(--bg-card)', border:`1px solid ${error ? 'var(--danger-border)' : 'var(--border)'}`,
          borderRadius:'var(--radius)', color:'var(--text-primary)', outline:'none',
          fontSize:14, cursor:'pointer', appearance:'auto',
        }}
        {...rest}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <span style={{fontSize:12,color:'var(--danger-text)'}}>{error}</span>}
    </div>
  );
};
