import api from './api';
import type { LoginCredentials, AuthTokens, AuthUser } from '../types';
import axios from 'axios';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const { data } = await axios.post('http://localhost:8000/api/auth/login/', credentials);
    localStorage.setItem('wms_access', data.access);
    localStorage.setItem('wms_refresh', data.refresh);
    localStorage.setItem('wms_user', JSON.stringify(data.user));
    return data;
  },
  async logout(): Promise<void> {
    const refresh = localStorage.getItem('wms_refresh');
    if (refresh) {
      try { await api.post('/auth/logout/', { refresh }); } catch {}
    }
    localStorage.removeItem('wms_access');
    localStorage.removeItem('wms_refresh');
    localStorage.removeItem('wms_user');
  },
  async getMe(): Promise<AuthUser> {
    const { data } = await api.get('/auth/me/');
    return data;
  },
  getStoredUser(): AuthUser | null {
    try { return JSON.parse(localStorage.getItem('wms_user') || 'null'); } catch { return null; }
  },
  isAuthenticated(): boolean {
    return !!localStorage.getItem('wms_access');
  },
};
