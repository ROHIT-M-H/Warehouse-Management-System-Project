import React from 'react';

type Variant = 'success'|'warning'|'danger'|'info'|'default';

const colors: Record<Variant, {bg:string,color:string,border:string}> = {
  success: {bg:'var(--success-bg)', color:'var(--success-text)', border:'var(--success-border)'},
  warning: {bg:'var(--warning-bg)', color:'var(--warning-text)', border:'var(--warning-border)'},
  danger:  {bg:'var(--danger-bg)',  color:'var(--danger-text)',  border:'var(--danger-border)'},
  info:    {bg:'var(--info-bg)',    color:'var(--info-text)',    border:'var(--info-border)'},
  default: {bg:'var(--bg-subtle)', color:'var(--text-secondary)', border:'var(--border)'},
};

interface Props { variant?: Variant; children: React.ReactNode; dot?: boolean; }

export const Badge: React.FC<Props> = ({ variant='default', children, dot=false }) => {
  const c = colors[variant];
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px',
      borderRadius:999, fontSize:11, fontWeight:600, letterSpacing:'0.02em',
      background:c.bg, color:c.color, border:`1px solid ${c.border}`,
    }}>
      {dot && <span style={{width:5,height:5,borderRadius:'50%',background:'currentColor'}} />}
      {children}
    </span>
  );
};
