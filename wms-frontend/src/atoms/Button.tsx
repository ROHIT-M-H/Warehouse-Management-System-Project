import React from 'react';

type Variant = 'primary'|'secondary'|'danger'|'ghost'|'success';
type Size = 'sm'|'md'|'lg';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant; size?: Size; loading?: boolean; icon?: React.ReactNode;
}

const styles: Record<Variant, string> = {
  primary:   'background:var(--brand-600);color:#fff;border:1px solid var(--brand-700)',
  secondary: 'background:var(--bg-card);color:var(--text-primary);border:1px solid var(--border)',
  danger:    'background:var(--danger-bg);color:var(--danger-text);border:1px solid var(--danger-border)',
  ghost:     'background:transparent;color:var(--text-secondary);border:1px solid transparent',
  success:   'background:var(--success-bg);color:var(--success-text);border:1px solid var(--success-border)',
};
const sizes: Record<Size, string> = {
  sm: 'padding:4px 10px;font-size:12px;gap:4px',
  md: 'padding:7px 14px;font-size:13px;gap:6px',
  lg: 'padding:10px 20px;font-size:14px;gap:8px',
};

export const Button: React.FC<Props> = ({
  variant='primary', size='md', loading=false, icon, children, disabled, style, ...rest
}) => (
  <button
    style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      borderRadius:'var(--radius)', fontWeight:500, cursor: disabled||loading ? 'not-allowed' : 'pointer',
      opacity: disabled||loading ? 0.6 : 1, transition:'opacity 0.15s, box-shadow 0.15s',
      whiteSpace:'nowrap', ...Object.fromEntries(styles[variant].split(';').filter(Boolean).map(s => s.split(':'))),
      ...Object.fromEntries(sizes[size].split(';').filter(Boolean).map(s => s.split(':'))),
      ...style,
    } as React.CSSProperties}
    disabled={disabled||loading}
    {...rest}
  >
    {loading ? <span style={{width:14,height:14,border:'2px solid currentColor',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.6s linear infinite',display:'inline-block'}} /> : icon}
    {children}
  </button>
);
