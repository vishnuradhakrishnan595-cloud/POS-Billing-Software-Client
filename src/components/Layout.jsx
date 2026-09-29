import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Receipt, Package, Tags, Award, Boxes, Users, BarChart3, UserCog, User, LogOut, Menu, X, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const ALL = ['ADMIN', 'MANAGER', 'CASHIER', 'STAFF'], AMC = ['ADMIN', 'MANAGER', 'CASHIER'], AM = ['ADMIN', 'MANAGER'];
export const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ALL },
  { to: '/pos', label: 'POS / New Sale', icon: ShoppingCart, roles: AMC },
  { to: '/sales', label: 'Sales', icon: Receipt, roles: AMC },
  { to: '/products', label: 'Products', icon: Package, roles: ALL, end: true },
  { to: '/products/categories', label: 'Categories', icon: Tags, roles: AM },
  { to: '/products/brands', label: 'Brands', icon: Award, roles: AM },
  { to: '/inventory', label: 'Inventory', icon: Boxes, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { to: '/customers', label: 'Customers', icon: Users, roles: ALL },
  { to: '/reports', label: 'Reports', icon: BarChart3, roles: AM },
  { to: '/users', label: 'Users', icon: UserCog, roles: ['ADMIN'] },
  { to: '/profile', label: 'Profile', icon: User, roles: ALL },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const items = NAV.filter((n) => n.roles.includes(user?.role));
  const out = async () => { await logout(); nav('/login'); };
  const links = (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
          className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-brand text-white' : 'text-slate-300 hover:bg-white/10'}`}>
          <Icon size={18} />{label}</NavLink>))}
      <button onClick={out} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10"><LogOut size={18} />Logout</button>
    </nav>
  );
  const brand = <div className="flex h-16 items-center gap-2 px-5 text-lg font-bold text-white"><Store size={22} className="text-blue-400" />POS SYSTEM</div>;
  return (
    <div className="flex h-screen">
      <aside className="no-print hidden w-64 shrink-0 flex-col bg-navy lg:flex">{brand}{links}</aside>
      {open && <div className="no-print fixed inset-0 z-40 lg:hidden"><div className="absolute inset-0 bg-slate-900/60" onClick={() => setOpen(false)} />
        <aside className="relative flex h-full w-64 flex-col bg-navy">{brand}{links}<button aria-label="Close menu" onClick={() => setOpen(false)} className="absolute right-3 top-4 text-white"><X /></button></aside></div>}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
          <button aria-label="Open menu" className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)}><Menu /></button>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right"><p className="text-sm font-semibold leading-tight">{user?.first_name || user?.username}</p><p className="text-xs text-slate-500">{user?.role}</p></div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{(user?.first_name || user?.username || '?')[0].toUpperCase()}</div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
