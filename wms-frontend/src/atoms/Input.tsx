import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; hint?: string; leftIcon?: React.ReactNode; rightElement?: React.ReactNode;
}

export const Input: React.FC<Props> = ({ label, error, hint, leftIcon, rightElement, id, style, ...rest }) => {
  const inputId = id || `input-${Math.random().toString(36).slice(2)}`;
  return (
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      {label && <label htmlFor={inputId} style={{fontSize:13,fontWeight:500,color:'var(--text-secondary)'}}>{label}</label>}
      <div style={{position:'relative',display:'flex',alignItems:'center'}}>
        {leftIcon && <span style={{position:'absolute',left:10,color:'var(--text-muted)',display:'flex',alignItems:'center'}}>{leftIcon}</span>}
        <input
          id={inputId}
          style={{
            width:'100%', padding:'8px 12px', paddingLeft: leftIcon ? 34 : 12,
            paddingRight: rightElement ? 36 : 12,
            background:'var(--bg-card)', border:`1px solid ${error ? 'var(--danger-border)' : 'var(--border)'}`,
            borderRadius:'var(--radius)', color:'var(--text-primary)', outline:'none',
            transition:'border-color 0.15s', fontSize:14, ...style,
          } as React.CSSProperties}
          onFocus={e => e.target.style.borderColor = 'var(--brand-500)'}
          onBlur={e => e.target.style.borderColor = error ? 'var(--danger-border)' : 'var(--border)'}
          {...rest}
        />
        {rightElement && <span style={{position:'absolute',right:10,color:'var(--text-muted)',display:'flex',alignItems:'center'}}>{rightElement}</span>}
      </div>
      {error && <span style={{fontSize:12,color:'var(--danger-text)'}}>{error}</span>}
      {hint && !error && <span style={{fontSize:12,color:'var(--text-muted)'}}>{hint}</span>}
    </div>
  );
};
