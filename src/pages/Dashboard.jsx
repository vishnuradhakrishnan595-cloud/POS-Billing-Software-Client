
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  AlertTriangle,
  ArrowUpRight,
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  Plus,
  ArrowRight,
} from 'lucide-react';

import {
  inventoryService,
  reportService,
  salesService,
} from '../services/index.js';

import { useAuth } from '../context/AuthContext.jsx';

import {
  Badge,
  Button,
  Card,
  Spinner,
} from '../components/ui.jsx';

import {
  canCreateSales,
  canManageProducts,
  canViewReports,
} from '../utils/permissions.js';

import {
  fmtDate,
  money,
  toList,
} from '../utils/format.js';

import { statusTone } from './Sales.jsx';


// =========================================================
// STAT CARD
// =========================================================

const Stat = ({
  icon: Icon,
  label,
  value,
  description,
  iconClass = 'bg-indigo-100 text-indigo-600',
  valueClass = 'text-slate-900',
}) => (
  <Card className="group relative overflow-hidden border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
    {/* Decorative background */}
    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-50 transition-transform duration-300 group-hover:scale-125" />

    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">
          {label}
        </p>

        <p
          className={`mt-2 text-2xl font-bold tracking-tight ${valueClass}`}
        >
          {value}
        </p>

        {description && (
          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        )}
      </div>

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass} shadow-sm`}
      >
        <Icon size={21} strokeWidth={2} />
      </div>
    </div>
  </Card>
);


// =========================================================
// SECTION HEADER
// =========================================================

const SectionHeader = ({
  title,
  subtitle,
  action,
}) => (
  <div className="mb-5 flex items-center justify-between gap-4">
    <div>
      <h2 className="text-base font-bold text-slate-900">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500">
          {subtitle}
        </p>
      )}
    </div>

    {action}
  </div>
);


// =========================================================
// DASHBOARD
// =========================================================

export default function Dashboard() {
  const { user } = useAuth();

  const [d, setD] = useState({});
  const [loading, setLoading] = useState(true);


  // =======================================================
  // LOAD DASHBOARD DATA
  // =======================================================

  useEffect(() => {
    const jobs = {
      stats:
        canViewReports(user) &&
        reportService.getDashboard(),

      recent:
        canCreateSales(user) &&
        salesService.getRecentSales(6),

      low:
        inventoryService.getLowStock(),

      daily:
        canViewReports(user) &&
        reportService.getDailySales(),

      top:
        canViewReports(user) &&
        reportService.getTopProducts(),
    };

    const keys = Object.keys(jobs);

    Promise.allSettled(
      keys.map((key) => jobs[key] || Promise.resolve(null))
    ).then((results) => {
      setD(
        Object.fromEntries(
          keys.map((key, index) => [
            key,
            results[index].status === 'fulfilled'
              ? results[index].value
              : null,
          ])
        )
      );

      setLoading(false);
    });
  }, [user]);


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner text="Loading dashboard..." />
      </div>
    );
  }


  // =======================================================
  // DATA
  // =======================================================

  const s = d.stats;

  const recent = toList(d.recent);
  const low = toList(d.low);
  const daily = toList(d.daily);
  const top = toList(d.top).slice(0, 5);


  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="min-h-full space-y-7 bg-slate-50/40">


      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-900 p-6 shadow-xl sm:p-7">

        {/* Decorative circles */}
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-2xl" />

        <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-200 backdrop-blur">
                POS Dashboard
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Welcome back,{' '}
              <span className="text-indigo-300">
                {user?.first_name || user?.username}
              </span>
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Monitor your sales, inventory, customers, and business
              performance from one place.
            </p>
          </div>


          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">

            {canCreateSales(user) && (
              <Link to="/pos">
                <Button className="border-0 bg-white text-slate-900 shadow-lg hover:bg-slate-100">
                  <ShoppingBag size={16} />
                  New Sale
                </Button>
              </Link>
            )}

            {canManageProducts(user) && (
              <Link to="/products">
                <Button
                  variant="secondary"
                  className="border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20"
                >
                  <Plus size={16} />
                  Add Product
                </Button>
              </Link>
            )}

            {canViewReports(user) && (
              <Link to="/reports">
                <Button
                  variant="secondary"
                  className="border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20"
                >
                  Reports
                  <ArrowUpRight size={16} />
                </Button>
              </Link>
            )}

          </div>
        </div>
      </div>


      {/* ===================================================
          STAT CARDS
      =================================================== */}

      {s && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <Stat
            icon={DollarSign}
            label="Today's Sales"
            value={money(s.today_sales)}
            description="Revenue generated today"
            iconClass="bg-emerald-100 text-emerald-600"
            valueClass="text-emerald-700"
          />

          <Stat
            icon={ShoppingBag}
            label="Today's Orders"
            value={s.today_orders}
            description="Orders processed today"
            iconClass="bg-blue-100 text-blue-600"
          />

          <Stat
            icon={Package}
            label="Total Products"
            value={s.total_products}
            description="Products in inventory"
            iconClass="bg-violet-100 text-violet-600"
          />

          <Stat
            icon={AlertTriangle}
            label="Low Stock"
            value={s.low_stock_products}
            description="Products need attention"
            iconClass="bg-amber-100 text-amber-600"
            valueClass="text-amber-700"
          />

          <Stat
            icon={Users}
            label="Total Customers"
            value={s.total_customers}
            description="Registered customers"
            iconClass="bg-cyan-100 text-cyan-600"
          />

          <Stat
            icon={TrendingUp}
            label="Total Revenue"
            value={money(s.total_revenue)}
            description="Overall business revenue"
            iconClass="bg-emerald-100 text-emerald-600"
            valueClass="text-emerald-700"
          />

          <Stat
            icon={TrendingUp}
            label="Monthly Revenue"
            value={money(s.monthly_revenue)}
            description="Revenue this month"
            iconClass="bg-indigo-100 text-indigo-600"
            valueClass="text-indigo-700"
          />

        </div>
      )}


      {/* ===================================================
          CHARTS
      =================================================== */}

      {daily.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">

          {/* Revenue Chart */}
          <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-5 py-4">
              <SectionHeader
                title="Revenue Overview"
                subtitle="Daily revenue performance"
              />
            </div>

            <div className="px-4 pb-5 pt-2">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={daily}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -15,
                      bottom: 0,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="#E2E8F0"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="date"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748B' }}
                    />

                    <YAxis
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748B' }}
                    />

                    <Tooltip
                      formatter={(value) => money(value)}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        boxShadow:
                          '0 10px 30px rgba(15, 23, 42, 0.10)',
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4F46E5"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{
                        r: 5,
                        strokeWidth: 0,
                      }}
                    />

                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>


          {/* Top Products */}
          <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-5 py-4">
              <SectionHeader
                title="Top Products"
                subtitle="Best performing products"
              />
            </div>

            <div className="px-4 pb-5 pt-2">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={top}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 10,
                      left: 0,
                      bottom: 0,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="#E2E8F0"
                      horizontal={false}
                    />

                    <XAxis
                      type="number"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748B' }}
                    />

                    <YAxis
                      type="category"
                      dataKey="product_name"
                      width={110}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#475569' }}
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        boxShadow:
                          '0 10px 30px rgba(15, 23, 42, 0.10)',
                      }}
                    />

                    <Bar
                      dataKey="quantity_sold"
                      fill="#10B981"
                      radius={[0, 6, 6, 0]}
                      barSize={18}
                    />

                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

        </div>
      )}


      {/* ===================================================
          RECENT SALES + LOW STOCK
      =================================================== */}

      <div className="grid gap-5 lg:grid-cols-2">


        {/* Recent Sales */}
        {canCreateSales(user) && (
          <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-5 py-4">
              <SectionHeader
                title="Recent Sales"
                subtitle="Latest transactions"
                action={
                  <Link
                    to="/sales"
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-800"
                  >
                    View all
                    <ArrowRight size={14} />
                  </Link>
                }
              />
            </div>

            {recent.length === 0 ? (

              <div className="flex min-h-[180px] items-center justify-center px-5">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <ShoppingBag
                      size={20}
                      className="text-slate-400"
                    />
                  </div>

                  <p className="text-sm font-medium text-slate-600">
                    No sales yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    New transactions will appear here.
                  </p>
                </div>
              </div>

            ) : (

              <ul className="divide-y divide-slate-100">

                {recent.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                  >

                    <div className="min-w-0">

                      <Link
                        to={`/sales/${r.id}`}
                        className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        {r.invoice_number}
                      </Link>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {r.customer_name || 'Walk-in'}
                        <span className="mx-1.5 text-slate-300">
                          •
                        </span>
                        {fmtDate(r.created_at)}
                      </p>

                    </div>


                    <div className="shrink-0 text-right">

                      <p className="text-sm font-bold text-slate-900">
                        {money(r.total_amount)}
                      </p>

                      <div className="mt-1">
                        <Badge tone={statusTone(r.sale_status)}>
                          {r.payment_method}
                        </Badge>
                      </div>

                    </div>

                  </li>
                ))}

              </ul>

            )}

          </Card>
        )}


        {/* Low Stock */}
        <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-4">
            <SectionHeader
              title="Low Stock"
              subtitle="Products requiring attention"
            />
          </div>


          {low.length === 0 ? (

            <div className="flex min-h-[180px] items-center justify-center px-5">
              <div className="text-center">

                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                  <Package
                    size={20}
                    className="text-emerald-500"
                  />
                </div>

                <p className="text-sm font-medium text-slate-600">
                  Inventory looks good
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  All products are sufficiently stocked.
                </p>

              </div>
            </div>

          ) : (

            <ul className="divide-y divide-slate-100">

              {low.slice(0, 6).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50"
                >

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                      <Package
                        size={17}
                        className="text-amber-600"
                      />
                    </div>

                    <span className="truncate text-sm font-semibold text-slate-700">
                      {p.name}
                    </span>

                  </div>

                  <Badge tone="amber">
                    Stock: {p.stock_quantity}
                  </Badge>

                </li>
              ))}

            </ul>

          )}


          {['ADMIN', 'MANAGER', 'STAFF'].includes(user?.role) && (
            <div className="border-t border-slate-100 px-5 py-3">

              <Link
                to="/inventory"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-800"
              >
                Manage Inventory
                <ArrowRight size={15} />
              </Link>

            </div>
          )}

        </Card>

      </div>


      {/* ===================================================
          QUICK ACTIONS
      =================================================== */}

      <Card className="border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900">
            Quick Actions
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Frequently used management tools
          </p>
        </div>


        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          {canCreateSales(user) && (
            <Link
              to="/pos"
              className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <ShoppingBag size={18} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  New Sale
                </p>

                <p className="text-xs text-slate-500">
                  Open POS
                </p>
              </div>
            </Link>
          )}


          {canManageProducts(user) && (
            <Link
              to="/products"
              className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <Package size={18} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  Products
                </p>

                <p className="text-xs text-slate-500">
                  Manage products
                </p>
              </div>
            </Link>
          )}


          {canCreateSales(user) && (
            <Link
              to="/customers"
              className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-all hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">
                <Users size={18} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  Customers
                </p>

                <p className="text-xs text-slate-500">
                  Manage customers
                </p>
              </div>
            </Link>
          )}


          {canViewReports(user) && (
            <Link
              to="/reports"
              className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <TrendingUp size={18} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  Reports
                </p>

                <p className="text-xs text-slate-500">
                  View analytics
                </p>
              </div>
            </Link>
          )}

        </div>

      </Card>

    </div>
  );
}
