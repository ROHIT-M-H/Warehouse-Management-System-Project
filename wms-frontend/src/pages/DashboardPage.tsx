import React, { useEffect, useState } from 'react';
import { Package, BarChart3, AlertTriangle, Users, ArrowLeftRight, CheckCircle, Clock, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDashboard } from '../services/wms.service';
import { StatCard } from '../molecules/StatCard';
import { PageHeader } from '../molecules/PageHeader';
import { Badge } from '../atoms/Badge';
import { Card } from '../atoms/Card';
import { Spinner } from '../atoms/Spinner';
import type { AdminDashboard, OperatorDashboard } from '../types';
import { formatDateTime, movementTypeLabel, statusBadge, movementTypeBadge } from '../utils';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [adminData, setAdminData] = useState<AdminDashboard | null>(null);
  const [opData, setOpData] = useState<OperatorDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (user?.role === 'admin') {
      getDashboard.admin().then(setAdminData).finally(() => setLoading(false));
    } else {
      getDashboard.operator().then(setOpData).finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <Spinner size={32} />
    </div>
  );

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0]}!`}
        subtitle={user?.role === 'admin' ? 'Here\'s your warehouse at a glance.' : 'Your workspace and pending tasks.'}
      />

      {/* ── Admin Dashboard ── */}
      {user?.role === 'admin' && adminData && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <StatCard label="Total Products" value={adminData.total_products} icon={<Package size={18} />} accent="var(--brand-500)" />
            <StatCard label="Total Inventory Units" value={adminData.total_inventory_units.toLocaleString()} icon={<BarChart3 size={18} />} accent="#10b981" />
            <StatCard label="Low Stock Items" value={adminData.low_stock_items} icon={<AlertTriangle size={18} />} accent="#f59e0b" sub={adminData.low_stock_items > 0 ? 'Needs attention' : 'All good'} />
            <StatCard label="Active Operators" value={adminData.active_operators} icon={<Users size={18} />} accent="#8b5cf6" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Card>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: 'var(--text-primary)' }}>Recent Movements</h3>
              {adminData.recent_movements.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No recent movements.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {adminData.recent_movements.slice(0, 6).map(m => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <Badge variant={movementTypeBadge(m.movement_type)}>{movementTypeLabel[m.movement_type]}</Badge>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.product_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Qty: {m.quantity} · {m.warehouse_name}</div>
                      </div>
                      <Badge variant={statusBadge(m.status)}>{m.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={15} color="var(--warning-text)" /> Low Stock Alerts
              </h3>
              {adminData.low_stock_list.length === 0 ? (
                <p style={{ color: 'var(--success-text)', fontSize: 13 }}>✓ All products have sufficient stock.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {adminData.low_stock_list.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{item.product_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.warehouse_name} · Min: {item.product_min_stock}</div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger-text)' }}>{item.quantity_available}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      {/* ── Operator Dashboard ── */}
      {user?.role === 'operator' && opData && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <StatCard label="Received Today" value={opData.products_received_today} icon={<CheckCircle size={18} />} accent="#10b981" />
            <StatCard label="Issued Today" value={opData.products_issued_today} icon={<ArrowLeftRight size={18} />} accent="var(--brand-500)" />
            <StatCard label="Pending Tasks" value={opData.pending_stock_updates} icon={<Clock size={18} />} accent="#f59e0b" sub={opData.pending_stock_updates > 0 ? 'Action required' : 'All done'} />
            <StatCard label="Low Stock Alerts" value={opData.low_stock_alerts} icon={<Bell size={18} />} accent="#ef4444" />
          </div>

          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Pending Assignments</h3>
            {opData.pending_movements.length === 0 ? (
              <p style={{ color: 'var(--success-text)', fontSize: 13 }}>✓ No pending movements. You're all caught up!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {opData.pending_movements.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <Badge variant={movementTypeBadge(m.movement_type)}>{movementTypeLabel[m.movement_type]}</Badge>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{m.product_name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({m.product_sku})</span></div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Qty: {m.quantity} · {m.warehouse_name} · {formatDateTime(m.created_at)}</div>
                    </div>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
