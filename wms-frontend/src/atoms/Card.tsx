import React from 'react';

interface Props { children: React.ReactNode; style?: React.CSSProperties; className?: string; padding?: number; }

export const Card: React.FC<Props> = ({ children, style, padding=20 }) => (
  <div style={{
    background:'var(--bg-card)', border:'1px solid var(--border)',
    borderRadius:'var(--radius-lg)', padding, boxShadow:'var(--shadow-sm)', ...style,
  }}>
    {children}
  </div>
);
