import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService } from '../services/index.js';
import { clearAuth } from '../services/api.js';
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
const stored = () => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } };
export function AuthProvider({ children }) {
  const [user, setUser] = useState(stored);
  const saveUser = useCallback((u) => { localStorage.setItem('user', JSON.stringify(u)); setUser(u); }, []);
  const login = async (username, password) => {
    const d = await authService.login(username, password);
    localStorage.setItem('access_token', d.access);
    localStorage.setItem('refresh_token', d.refresh);
    saveUser(d.user);
    return d.user;
  };
  const logout = async () => {
    try { await authService.logout(localStorage.getItem('refresh_token')); } catch { /* token may already be invalid */ }
    clearAuth(); setUser(null);
  };
  useEffect(() => {
    if (localStorage.getItem('access_token')) authService.getProfile().then((p) => saveUser({ ...stored(), ...p })).catch(() => {});
  }, [saveUser]);
  return <Ctx.Provider value={{ user, isAuthenticated: !!user, login, logout, saveUser }}>{children}</Ctx.Provider>;
}
