import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Users, Warehouse, ArrowLeftRight,
  ClipboardList, LogOut, Moon, Sun, BarChart3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface NavItem { label: string; path: string; icon: React.ReactNode; roles: string[]; }

const NAV: NavItem[] = [
  { label: 'Dashboard',        path: '/dashboard',    icon: <LayoutDashboard size={16} />, roles: ['admin','operator'] },
  { label: 'Products',         path: '/products',     icon: <Package size={16} />,          roles: ['admin','operator'] },
  { label: 'Inventory',        path: '/inventory',    icon: <BarChart3 size={16} />,        roles: ['admin','operator'] },
  { label: 'Stock Movements',  path: '/movements',    icon: <ArrowLeftRight size={16} />,   roles: ['admin','operator'] },
  { label: 'Operators',        path: '/operators',    icon: <Users size={16} />,            roles: ['admin'] },
  { label: 'Warehouses',       path: '/warehouses',   icon: <Warehouse size={16} />,        roles: ['admin'] },
  { label: 'Categories',       path: '/categories',   icon: <ClipboardList size={16} />,    roles: ['admin'] },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items = NAV.filter(n => user && n.roles.includes(user.role));

  return (
    <aside style={{
      width: 'var(--sidebar-width)', minHeight: '100vh', background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      position: 'fixed', left: 0, top: 0, zIndex: 200,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 'var(--radius)', background: 'var(--brand-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16,
          }}>W</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>WMS</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Warehouse Mgmt</div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {items.map(item => {
          const active = pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 'var(--radius)',
                background: active ? 'var(--brand-50)' : 'transparent',
                color: active ? 'var(--brand-700)' : 'var(--text-secondary)',
                border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer',
                fontWeight: active ? 600 : 400, fontSize: 13, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {item.icon}
              {item.label}
              {active && <div style={{ marginLeft: 'auto', width: 3, height: 16, background: 'var(--brand-600)', borderRadius: 2 }} />}
            </button>
          );
        })}
      </nav>

      {/* Bottom: user info + actions */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
            borderRadius: 'var(--radius)', border: 'none', background: 'transparent',
            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, width: '100%',
          }}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        <div style={{
          padding: '10px', borderRadius: 'var(--radius)',
          background: 'var(--bg-subtle)', display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
            {user?.role === 'admin' ? '🔐 Administrator' : '🏭 Warehouse Operator'}
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
            borderRadius: 'var(--radius)', border: 'none', background: 'transparent',
            color: 'var(--danger-text)', cursor: 'pointer', fontSize: 13, width: '100%',
          }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
};
