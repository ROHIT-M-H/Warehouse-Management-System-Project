import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { extractErrors } from '../utils';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Email and password are required.'); return; }
    setLoading(true); setError('');
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(extractErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-page)', padding: 16,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: 'var(--brand-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 22, margin: '0 auto 14px',
          }}>W</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Warehouse Management</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: 28, boxShadow: 'var(--shadow-md)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              leftIcon={<Mail size={15} />}
            />
            <Input
              label="Password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              leftIcon={<Lock size={15} />}
              rightElement={
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            {error && (
              <div style={{
                padding: '10px 12px', background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)', borderRadius: 'var(--radius)',
                fontSize: 13, color: 'var(--danger-text)',
              }}>{error}</div>
            )}

            <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: 4 }}>
              Sign In
            </Button>
          </form>

          <div style={{ marginTop: 20, padding: '14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--text-muted)' }}>
            <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Demo credentials</div>
            <div>Admin: <span style={{ fontFamily: 'monospace' }}>admin@wms.com / Admin@1234</span></div>
            <div>Operator: <span style={{ fontFamily: 'monospace' }}>bob@wms.com / Operator@1234</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
