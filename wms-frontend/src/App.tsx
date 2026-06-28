import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './organisms/Sidebar';
import { Spinner } from './atoms/Spinner';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { InventoryPage } from './pages/InventoryPage';
import { StockMovementsPage } from './pages/StockMovementsPage';
import { OperatorsPage } from './pages/OperatorsPage';
import { WarehousesPage } from './pages/WarehousesPage';
import { CategoriesPage } from './pages/CategoriesPage';

// ─── Guards ──────────────────────────────────────
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <Spinner size={36} />
    </div>
  );
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
};

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const PublicOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// ─── Layout ──────────────────────────────────────
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    <Sidebar />
    <main style={{
      marginLeft: 'var(--sidebar-width)', flex: 1,
      padding: '28px 32px', minHeight: '100vh',
      background: 'var(--bg-page)', maxWidth: 'calc(100vw - var(--sidebar-width))',
    }}>
      {children}
    </main>
  </div>
);

// ─── App ─────────────────────────────────────────
const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />

    <Route path="/" element={<RequireAuth><AppLayout><DashboardPage /></AppLayout></RequireAuth>}>
    </Route>
    <Route path="/dashboard" element={<RequireAuth><AppLayout><DashboardPage /></AppLayout></RequireAuth>} />
    <Route path="/products" element={<RequireAuth><AppLayout><ProductsPage /></AppLayout></RequireAuth>} />
    <Route path="/inventory" element={<RequireAuth><AppLayout><InventoryPage /></AppLayout></RequireAuth>} />
    <Route path="/movements" element={<RequireAuth><AppLayout><StockMovementsPage /></AppLayout></RequireAuth>} />
    <Route path="/operators" element={<RequireAuth><RequireAdmin><AppLayout><OperatorsPage /></AppLayout></RequireAdmin></RequireAuth>} />
    <Route path="/warehouses" element={<RequireAuth><RequireAdmin><AppLayout><WarehousesPage /></AppLayout></RequireAdmin></RequireAuth>} />
    <Route path="/categories" element={<RequireAuth><RequireAdmin><AppLayout><CategoriesPage /></AppLayout></RequireAdmin></RequireAuth>} />

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)', color: 'var(--text-primary)',
              border: '1px solid var(--border)', fontSize: 13,
            },
          }}
        />
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
