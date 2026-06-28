import React from 'react';

interface Props { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode; }

export const EmptyState: React.FC<Props> = ({ icon, title, description, action }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', gap: 12 }}>
    {icon && <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{icon}</div>}
    <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>{title}</h4>
    {description && <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 300 }}>{description}</p>}
    {action && <div style={{ marginTop: 8 }}>{action}</div>}
  </div>
);
