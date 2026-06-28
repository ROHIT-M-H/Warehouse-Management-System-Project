import React from 'react';

interface Props { title: string; subtitle?: string; actions?: React.ReactNode; }

export const PageHeader: React.FC<Props> = ({ title, subtitle, actions }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{subtitle}</p>}
    </div>
    {actions && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div>}
  </div>
);
