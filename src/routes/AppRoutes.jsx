import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Layout from '../components/Layout.jsx';
import { Spinner } from '../components/ui.jsx';
const p = (f) => lazy(f);
const Login = p(() => import('../pages/auth/Login.jsx')), Register = p(() => import('../pages/auth/Register.jsx'));
const Dashboard = p(() => import('../pages/Dashboard.jsx')), POS = p(() => import('../pages/POS.jsx'));
const Sales = p(() => import('../pages/Sales.jsx')), SaleDetails = p(() => import('../pages/SaleDetails.jsx'));
const Inventory = p(() => import('../pages/Inventory.jsx')), Reports = p(() => import('../pages/Reports.jsx'));
const Profile = p(() => import('../pages/Profile.jsx')), Manage = p(() => import('../pages/Manage.jsx'));

function Protected() { const { isAuthenticated } = useAuth(); return isAuthenticated ? <Layout /> : <Navigate to="/login" replace />; }
function RoleRoute({ roles, children }) { const { user } = useAuth(); return roles.includes(user?.role) ? children : <Navigate to="/dashboard" replace />; }
const NotFound = () => (<div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center"><p className="text-6xl font-bold text-brand">404</p><p className="text-lg font-semibold">Page Not Found</p>
  <Link to="/dashboard" className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white">Back to Dashboard</Link></div>);
const AMC = ['ADMIN', 'MANAGER', 'CASHIER'], AM = ['ADMIN', 'MANAGER'];
const guard = (roles, el) => <RoleRoute roles={roles}>{el}</RoleRoute>;

export default function AppRoutes() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} />
        <Route element={<Protected />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={guard(AMC, <POS />)} />
          <Route path="/sales" element={guard(AMC, <Sales />)} />
          <Route path="/sales/:id" element={guard(AMC, <SaleDetails />)} />
          <Route path="/products" element={<Manage kind="products" />} />
          <Route path="/products/categories" element={guard(AM, <Manage kind="categories" />)} />
          <Route path="/products/brands" element={guard(AM, <Manage kind="brands" />)} />
          <Route path="/inventory" element={guard([...AM, 'STAFF'], <Inventory />)} />
          <Route path="/customers" element={<Manage kind="customers" />} />
          <Route path="/reports" element={guard(AM, <Reports />)} />
          <Route path="/users" element={guard(['ADMIN'], <Manage kind="users" />)} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
