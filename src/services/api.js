import axios from 'axios';
const BASE = import.meta.env.VITE_API_BASE_URL;
export const api = axios.create({ baseURL: BASE });
export const clearAuth = () => ['access_token', 'refresh_token', 'user'].forEach((k) => localStorage.removeItem(k));
const forceLogout = () => { clearAuth(); if (window.location.pathname !== '/login') window.location.href = '/login'; };

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('access_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

let refreshing = null; // shared promise: only one refresh request at a time
api.interceptors.response.use((r) => r, async (err) => {
  const orig = err.config;
  const isAuthUrl = /\/accounts\/(login|token\/refresh)\//.test(orig?.url || '');
  if (err.response?.status !== 401 || orig._retry || isAuthUrl) return Promise.reject(err);
  orig._retry = true;
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) { forceLogout(); return Promise.reject(err); }
  try {
    refreshing = refreshing || axios.post(`${BASE}/accounts/token/refresh/`, { refresh })
      .then((r) => {
        localStorage.setItem('access_token', r.data.access);
        if (r.data.refresh) localStorage.setItem('refresh_token', r.data.refresh);
        return r.data.access;
      }).finally(() => { refreshing = null; });
    const token = await refreshing;
    orig.headers.Authorization = `Bearer ${token}`;
    return api(orig);
  } catch { forceLogout(); return Promise.reject(err); }
});
