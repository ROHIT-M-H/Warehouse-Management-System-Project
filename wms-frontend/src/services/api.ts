import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

const api = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } });

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wms_access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('wms_refresh');
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh/`, { refresh });
          localStorage.setItem('wms_access', data.access);
          localStorage.setItem('wms_refresh', data.refresh);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          localStorage.removeItem('wms_access');
          localStorage.removeItem('wms_refresh');
          localStorage.removeItem('wms_user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
