import { useCallback, useEffect, useState } from 'react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  CalendarDays,
  ChartNoAxesCombined,
  CircleDollarSign,
  FileBarChart,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  WalletCards,
  Receipt,
  Percent,
} from 'lucide-react';

import { reportService } from '../services/index.js';

import {
  Button,
  Card,
  ErrorMessage,
  Input,
  Spinner,
} from '../components/ui.jsx';

import {
  getApiErrorMessage,
  money,
  toList,
} from '../utils/format.js';

// =========================================================
// CHART COLORS
// =========================================================

const COLORS = [
  '#4F46E5',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#06B6D4',
];

// =========================================================
// CUSTOM TOOLTIP
// =========================================================

const SalesTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        px-4
        py-3
        shadow-xl
      "
    >
      <p className="mb-1 text-xs font-semibold text-slate-500">
        {label}
      </p>

      <p className="text-sm font-black text-indigo-600">
        {money(payload[0]?.value)}
      </p>
    </div>
  );
};

// =========================================================
// CHART CARD
// =========================================================

const ChartCard = ({
  title,
  subtitle,
  icon,
  children,
}) => {
  return (
    <Card className="overflow-hidden p-0">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            {icon}
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500">
                {subtitle}
              </p>
            )}
          </div>

        </div>

      </div>

      {/* Chart */}
      <div className="h-72 p-4">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>

    </Card>
  );
};

// =========================================================
// STAT CARD
// =========================================================

const StatCard = ({
  label,
  value,
  icon,
  tone = 'indigo',
}) => {

  const tones = {
    indigo: {
      box: 'bg-indigo-50 text-indigo-600',
      value: 'text-indigo-700',
    },

    emerald: {
      box: 'bg-emerald-50 text-emerald-600',
      value: 'text-emerald-700',
    },

    amber: {
      box: 'bg-amber-50 text-amber-600',
      value: 'text-amber-700',
    },

    cyan: {
      box: 'bg-cyan-50 text-cyan-600',
      value: 'text-cyan-700',
    },

    violet: {
      box: 'bg-violet-50 text-violet-600',
      value: 'text-violet-700',
    },
  };

  const t = tones[tone] || tones.indigo;

  return (
    <Card className="group p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p
            className={`
              mt-2
              text-xl
              font-black
              ${t.value}
            `}
          >
            {value}
          </p>
        </div>

        <div
          className={`
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            ${t.box}
          `}
        >
          {icon}
        </div>

      </div>

    </Card>
  );
};

// =========================================================
// REPORTS
// =========================================================

export default function Reports() {

  // =======================================================
  // DATE FILTER
  // =======================================================

  const [range, setRange] = useState({
    start_date: '',
    end_date: '',
  });

  const [applied, setApplied] = useState({});

  // =======================================================
  // REPORT DATA
  // =======================================================

  const [d, setD] = useState(null);

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(true);

  // =======================================================
  // LOAD REPORTS
  // =======================================================

  const load = useCallback(async () => {

    setLoading(true);
    setError('');

    const p = {
      start_date:
        applied.start_date || undefined,

      end_date:
        applied.end_date || undefined,
    };

    try {

      const [
        summary,
        daily,
        monthly,
        top,
        pay,
      ] = await Promise.all([

        reportService.getSalesReport(p),

        reportService.getDailySales(p),

        reportService.getMonthlySales(p),

        reportService.getTopProducts(p),

        reportService.getPaymentSummary(p),

      ]);

      setD({
        summary,

        daily: toList(daily),

        monthly: toList(monthly),

        top: toList(top),

        pay: toList(pay),
      });

    } catch (e) {

      setError(
        getApiErrorMessage(e)
      );

    } finally {

      setLoading(false);

    }

  }, [applied]);

  // =======================================================
  // LOAD WHEN FILTER CHANGES
  // =======================================================

  useEffect(() => {
    load();
  }, [load]);

  // =======================================================
  // SUMMARY
  // =======================================================

  const s = d?.summary;

  const cards = s
    ? [
        [
          'Revenue',
          money(s.total_revenue),
          <CircleDollarSign size={20} />,
          'indigo',
        ],

        [
          'Orders',
          s.total_orders,
          <ShoppingBag size={20} />,
          'emerald',
        ],

        [
          'Avg Order Value',
          money(s.average_order_value),
          <TrendingUp size={20} />,
          'violet',
        ],

        [
          'Tax',
          money(s.total_tax),
          <Receipt size={20} />,
          'amber',
        ],

        [
          'Discounts',
          money(s.total_discounts),
          <Percent size={20} />,
          'cyan',
        ],
      ]
    : [];

  // =======================================================
  // APPLY FILTER
  // =======================================================

  const applyFilter = () => {
    setApplied({
      ...range,
    });
  };

  // =======================================================
  // RESET FILTER
  // =======================================================

  const resetFilter = () => {

    const empty = {
      start_date: '',
      end_date: '',
    };

    setRange(empty);
    setApplied({});
  };

  // =======================================================
  // MAIN UI
  // =======================================================

  return (
    <div className="space-y-5">

      {/* ===================================================
          PREMIUM HEADER
      =================================================== */}

      <div
        className="
          overflow-hidden
          rounded-3xl
          bg-gradient-to-br
          from-slate-950
          via-indigo-950
          to-indigo-900
          p-6
          text-white
          shadow-xl
          shadow-indigo-900/10
          sm:p-8
        "
      >

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2 text-indigo-300">

              <FileBarChart size={18} />

              <span className="text-xs font-bold uppercase tracking-[0.18em]">
                Business Analytics
              </span>

            </div>

            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Reports & Analytics
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-200">
              Monitor revenue, sales performance, payment
              methods and your top-performing products.
            </p>

          </div>

          <div className="flex items-center gap-3">

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">

              <ChartNoAxesCombined
                size={28}
                className="text-indigo-200"
              />

            </div>

          </div>

        </div>

      </div>

      {/* ===================================================
          DATE FILTER
      =================================================== */}

      <Card className="overflow-hidden p-0">

        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <CalendarDays size={19} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Report Period
              </h2>

              <p className="text-xs text-slate-500">
                Select a date range to filter your business reports.
              </p>
            </div>

          </div>

        </div>

        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-end">

          <div className="w-full md:max-w-xs">
            <Input
              label="Start Date"
              type="date"
              value={range.start_date}
              onChange={(e) =>
                setRange({
                  ...range,
                  start_date: e.target.value,
                })
              }
            />
          </div>

          <div className="w-full md:max-w-xs">
            <Input
              label="End Date"
              type="date"
              value={range.end_date}
              onChange={(e) =>
                setRange({
                  ...range,
                  end_date: e.target.value,
                })
              }
            />
          </div>

          <div className="flex gap-2">

            <Button
              onClick={applyFilter}
              className="min-w-[110px]"
            >
              <CalendarDays size={16} />
              Apply
            </Button>

            <Button
              variant="secondary"
              onClick={resetFilter}
            >
              <RefreshCw size={16} />
              Reset
            </Button>

          </div>

        </div>

      </Card>

      {/* ===================================================
          LOADING
      =================================================== */}

      {loading && (
        <Card className="flex min-h-[300px] items-center justify-center">
          <Spinner text="Loading reports..." />
        </Card>
      )}

      {/* ===================================================
          ERROR
      =================================================== */}

      {!loading && error && (
        <ErrorMessage
          message={error}
          onRetry={load}
        />
      )}

      {/* ===================================================
          REPORT CONTENT
      =================================================== */}

      {!loading &&
        !error &&
        d && (
          <>

            {/* =============================================
                SUMMARY CARDS
            ============================================== */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

              {cards.map(
                ([label, value, icon, tone]) => (
                  <StatCard
                    key={label}
                    label={label}
                    value={value}
                    icon={icon}
                    tone={tone}
                  />
                )
              )}

            </div>

            {/* =============================================
                DAILY + MONTHLY SALES
            ============================================== */}

            <div className="grid gap-5 lg:grid-cols-2">

              {/* Daily */}
              <ChartCard
                title="Daily Sales"
                subtitle="Revenue performance by day"
                icon={<TrendingUp size={19} />}
              >

                <LineChart
                  data={d.daily}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
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
                    content={<SalesTooltip />}
                  />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    dot={{
                      r: 3,
                      fill: '#4F46E5',
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />

                </LineChart>

              </ChartCard>

              {/* Monthly */}
              <ChartCard
                title="Monthly Sales"
                subtitle="Revenue performance by month"
                icon={<ChartNoAxesCombined size={19} />}
              >

                <BarChart
                  data={d.monthly}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E2E8F0"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
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
                    content={<SalesTooltip />}
                  />

                  <Bar
                    dataKey="revenue"
                    fill="#4F46E5"
                    radius={[6, 6, 0, 0]}
                  />

                </BarChart>

              </ChartCard>

              {/* ===========================================
                  PAYMENT METHODS
              ============================================ */}

              <ChartCard
                title="Payment Methods"
                subtitle="Revenue distribution by payment type"
                icon={<WalletCards size={19} />}
              >

                <PieChart>

                  <Pie
                    data={d.pay.map((x) => ({
                      ...x,
                      total_amount:
                        Number(x.total_amount) || 0,
                    }))}
                    dataKey="total_amount"
                    nameKey="payment_method"
                    cx="50%"
                    cy="45%"
                    outerRadius={90}
                    innerRadius={48}
                    paddingAngle={3}
                    label
                  >

                    {d.pay.map((x, i) => (
                      <Cell
                        key={x.payment_method}
                        fill={
                          COLORS[
                            i % COLORS.length
                          ]
                        }
                      />
                    ))}

                  </Pie>

                  <Tooltip
                    formatter={(value) =>
                      money(value)
                    }
                  />

                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />

                </PieChart>

              </ChartCard>

              {/* ===========================================
                  TOP PRODUCTS
              ============================================ */}

              <ChartCard
                title="Top Products"
                subtitle="Products ranked by quantity sold"
                icon={<Package size={19} />}
              >

                <BarChart
                  data={d.top}
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 20,
                    left: 10,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
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
                    width={120}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748B' }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="quantity_sold"
                    fill="#10B981"
                    radius={[0, 6, 6, 0]}
                  />

                </BarChart>

              </ChartCard>

            </div>

            {/* =============================================
                REPORT FOOTER
            ============================================== */}

            <Card className="border-indigo-100 bg-indigo-50 p-5">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                    <ChartNoAxesCombined size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-indigo-900">
                      Business Performance
                    </p>

                    <p className="text-xs text-indigo-700">
                      Reports are calculated from your sales
                      data and server-side totals.
                    </p>
                  </div>

                </div>

                <div className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-indigo-700 shadow-sm">
                  {applied.start_date ||
                  applied.end_date ? (
                    <>
                      {applied.start_date || 'Start'}{' '}
                      →{' '}
                      {applied.end_date || 'Today'}
                    </>
                  ) : (
                    'All available data'
                  )}
                </div>

              </div>

            </Card>

          </>
        )}

    </div>
  );
}