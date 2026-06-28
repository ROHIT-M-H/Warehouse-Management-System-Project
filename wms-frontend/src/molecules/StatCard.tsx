import React from 'react';
import { Card } from '../atoms/Card';

interface Props {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: string;
  sub?: string;
}

export const StatCard: React.FC<Props> = ({ label, value, icon, accent = 'var(--brand-500)', sub }) => (
  <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
      <span style={{
        width: 36, height: 36, borderRadius: 'var(--radius)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: accent + '18', color: accent,
      }}>{icon}</span>
    </div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  </Card>
);
