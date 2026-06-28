import React from 'react';

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string; error?: string;
}

export const TextArea: React.FC<Props> = ({ label, error, id, ...rest }) => {
  const textId = id || `ta-${Math.random().toString(36).slice(2)}`;
  return (
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      {label && <label htmlFor={textId} style={{fontSize:13,fontWeight:500,color:'var(--text-secondary)'}}>{label}</label>}
      <textarea
        id={textId}
        style={{
          width:'100%', padding:'8px 12px', minHeight:80, resize:'vertical',
          background:'var(--bg-card)', border:`1px solid ${error ? 'var(--danger-border)' : 'var(--border)'}`,
          borderRadius:'var(--radius)', color:'var(--text-primary)', outline:'none', fontSize:14,
        }}
        onFocus={e => e.target.style.borderColor = 'var(--brand-500)'}
        onBlur={e => e.target.style.borderColor = error ? 'var(--danger-border)' : 'var(--border)'}
        {...rest}
      />
      {error && <span style={{fontSize:12,color:'var(--danger-text)'}}>{error}</span>}
    </div>
  );
};
