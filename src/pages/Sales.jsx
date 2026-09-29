import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  Search,
  Receipt,
  CreditCard,
  CalendarDays,
  ShoppingCart,
  ArrowUpRight,
  RotateCcw,
  XCircle,
  CheckCircle2,
  Filter,
  RefreshCw,
} from 'lucide-react';

import { salesService } from '../services/index.js';
import useDebounce from '../hooks/useDebounce.js';

import {
  Badge,
  Card,
  EmptyState,
  ErrorMessage,
  Pagination,
  Select,
  Spinner,
  Table,
} from '../components/ui.jsx';

import {
  fmtDate,
  getApiErrorMessage,
  money,
  toList,
} from '../utils/format.js';

// =========================================================
// STATUS HELPERS
// =========================================================

export const statusTone = (s) =>
  s === 'COMPLETED'
    ? 'green'
    : s === 'CANCELLED'
    ? 'red'
    : 'amber';

const getStatusIcon = (status) => {
  if (status === 'COMPLETED') return CheckCircle2;
  if (status === 'CANCELLED') return XCircle;
  return RotateCcw;
};

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function Sales() {
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');
  const q = useDebounce(search);

  const [method, setMethod] = useState('');
  const [status, setStatus] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // =======================================================
  // LOAD SALES
  // =======================================================

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const d = await salesService.getSales({
        page,
        search: q || undefined,
        payment_method: method || undefined,
        sale_status: status || undefined,
        ordering: '-created_at',
      });

      setRows(toList(d));
      setCount(d.count ?? 0);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [page, q, method, status]);

  useEffect(() => {
    load();
  }, [load]);

  // =======================================================
  // RESET PAGE WHEN FILTERS CHANGE
  // =======================================================

  useEffect(() => {
    setPage(1);
  }, [q, method, status]);

  // =======================================================
  // SUMMARY
  // =======================================================

  const summary = useMemo(() => {
    const completed = rows.filter(
      (r) => r.sale_status === 'COMPLETED'
    ).length;

    const cancelled = rows.filter(
      (r) => r.sale_status === 'CANCELLED'
    ).length;

    const refunded = rows.filter(
      (r) => r.sale_status === 'REFUNDED'
    ).length;

    const total = rows.reduce(
      (sum, r) => sum + Number(r.total_amount || 0),
      0
    );

    return {
      completed,
      cancelled,
      refunded,
      total,
    };
  }, [rows]);

  // =======================================================
  // TABLE COLUMNS
  // =======================================================

  const columns = [
    {
      label: 'Invoice',
      render: (r) => (
        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-indigo-50
              text-indigo-600
            "
          >
            <Receipt size={16} />
          </div>

          <div className="min-w-0">

            <p className="truncate font-bold text-slate-800">
              {r.invoice_number}
            </p>

            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              Invoice
            </p>

          </div>

        </div>
      ),
    },

    {
      label: 'Customer',
      render: (r) => (
        <div>

          <p className="font-medium text-slate-700">
            {r.customer_name || 'Walk-in'}
          </p>

          {!r.customer_name && (
            <span className="text-[10px] text-slate-400">
              Guest customer
            </span>
          )}

        </div>
      ),
    },

    {
      label: 'Cashier',
      key: 'cashier_name',
      render: (r) => (
        <div className="flex items-center gap-2">

          <div
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-full
              bg-slate-100
              text-[10px]
              font-bold
              uppercase
              text-slate-600
            "
          >
            {(r.cashier_name || 'C')
              .charAt(0)
              .toUpperCase()}
          </div>

          <span className="text-sm text-slate-600">
            {r.cashier_name || '—'}
          </span>

        </div>
      ),
    },

    {
      label: 'Total',
      render: (r) => (
        <div>

          <p className="font-bold text-slate-900">
            {money(r.total_amount)}
          </p>

        </div>
      ),
    },

    {
      label: 'Payment',
      key: 'payment_method',
      render: (r) => (
        <span
          className="
            inline-flex
            items-center
            gap-1.5
            rounded-lg
            bg-slate-100
            px-2.5
            py-1.5
            text-xs
            font-bold
            text-slate-600
          "
        >
          <CreditCard size={13} />
          {r.payment_method}
        </span>
      ),
    },

    {
      label: 'Date',
      render: (r) => (
        <div className="flex items-center gap-2">

          <CalendarDays
            size={14}
            className="text-slate-400"
          />

          <span className="text-sm text-slate-600">
            {fmtDate(r.created_at)}
          </span>

        </div>
      ),
    },

    {
      label: 'Status',
      render: (r) => {
        const Icon = getStatusIcon(r.sale_status);

        return (
          <div className="flex items-center gap-2">

            <Icon
              size={15}
              className={
                r.sale_status === 'COMPLETED'
                  ? 'text-emerald-500'
                  : r.sale_status === 'CANCELLED'
                  ? 'text-red-500'
                  : 'text-amber-500'
              }
            />

            <Badge tone={statusTone(r.sale_status)}>
              {r.sale_status}
            </Badge>

          </div>
        );
      },
    },

    {
      label: 'Actions',
      render: (r) => (
        <Link
          aria-label={`View ${r.invoice_number}`}
          to={`/sales/${r.id}`}
          className="
            inline-flex
            items-center
            gap-1.5
            rounded-xl
            border
            border-slate-200
            bg-white
            px-3
            py-2
            text-xs
            font-bold
            text-slate-600
            shadow-sm
            transition
            hover:border-indigo-200
            hover:bg-indigo-50
            hover:text-indigo-600
          "
        >
          <Eye size={15} />
          View
        </Link>
      ),
    },
  ];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-5">

      {/* =====================================================
          PREMIUM HERO
      ===================================================== */}

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

          {/* Heading */}
          <div>

            <div className="mb-2 flex items-center gap-2 text-indigo-300">

              <ShoppingCart size={18} />

              <span className="text-xs font-bold uppercase tracking-[0.18em]">
                Transaction Management
              </span>

            </div>

            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Sales
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-200">
              Monitor transactions, payment methods, customers,
              invoices and sale statuses from one place.
            </p>

          </div>

          {/* Hero stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

            <div
              className="
                rounded-2xl
                border
                border-white/10
                bg-white/10
                px-4
                py-3
                backdrop-blur
              "
            >

              <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-300">
                Records
              </p>

              <p className="mt-1 text-xl font-black">
                {count}
              </p>

            </div>

            <div
              className="
                rounded-2xl
                border
                border-white/10
                bg-white/10
                px-4
                py-3
                backdrop-blur
              "
            >

              <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-300">
                Completed
              </p>

              <p className="mt-1 text-xl font-black">
                {summary.completed}
              </p>

            </div>

            <div
              className="
                col-span-2
                rounded-2xl
                border
                border-white/10
                bg-white/10
                px-4
                py-3
                backdrop-blur
                sm:col-span-1
              "
            >

              <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-300">
                Page Sales
              </p>

              <p className="mt-1 text-xl font-black">
                {money(summary.total)}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Total */}
        <Card className="group overflow-hidden p-0">

          <div className="p-5">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Page Revenue
                </p>

                <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                  {money(summary.total)}
                </p>

              </div>

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-indigo-50
                  text-indigo-600
                  transition
                  group-hover:scale-105
                "
              >
                <ArrowUpRight size={20} />
              </div>

            </div>

          </div>

          <div className="h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />

        </Card>

        {/* Completed */}
        <Card className="group overflow-hidden p-0">

          <div className="p-5">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Completed
                </p>

                <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                  {summary.completed}
                </p>

              </div>

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-emerald-50
                  text-emerald-600
                  transition
                  group-hover:scale-105
                "
              >
                <CheckCircle2 size={20} />
              </div>

            </div>

          </div>

          <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />

        </Card>

        {/* Cancelled */}
        <Card className="group overflow-hidden p-0">

          <div className="p-5">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Cancelled
                </p>

                <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                  {summary.cancelled}
                </p>

              </div>

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-red-50
                  text-red-600
                  transition
                  group-hover:scale-105
                "
              >
                <XCircle size={20} />
              </div>

            </div>

          </div>

          <div className="h-1 bg-gradient-to-r from-red-500 to-rose-500" />

        </Card>

        {/* Refunded */}
        <Card className="group overflow-hidden p-0">

          <div className="p-5">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Refunded
                </p>

                <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                  {summary.refunded}
                </p>

              </div>

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-amber-50
                  text-amber-600
                  transition
                  group-hover:scale-105
                "
              >
                <RotateCcw size={20} />
              </div>

            </div>

          </div>

          <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />

        </Card>

      </div>

      {/* =====================================================
          FILTER + SALES TABLE
      ===================================================== */}

      <Card className="overflow-hidden">

        {/* Section Header */}
        <div
          className="
            flex
            flex-col
            gap-3
            border-b
            border-slate-100
            bg-slate-50/60
            p-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div className="flex items-center gap-3">

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-indigo-100
                text-indigo-600
              "
            >
              <Receipt size={18} />
            </div>

            <div>

              <h2 className="text-sm font-bold text-slate-900">
                Sales Transactions
              </h2>

              <p className="text-xs text-slate-500">
                Search and filter transaction records
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3
              py-2
              text-xs
              font-bold
              text-slate-600
              shadow-sm
              transition
              hover:border-indigo-200
              hover:bg-indigo-50
              hover:text-indigo-600
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <RefreshCw
              size={14}
              className={loading ? 'animate-spin' : ''}
            />
            Refresh
          </button>

        </div>

        {/* ===================================================
            FILTER BAR
        =================================================== */}

        <div
          className="
            flex
            flex-col
            gap-3
            border-b
            border-slate-100
            p-4
            lg:flex-row
            lg:items-center
          "
        >

          {/* Search */}
          <div className="relative min-w-0 flex-1">

            <Search
              size={17}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              aria-label="Search invoices"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search invoice or customer..."
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                py-2.5
                pl-10
                pr-4
                text-sm
                text-slate-700
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-indigo-300
                focus:bg-white
                focus:ring-4
                focus:ring-indigo-50
              "
            />

          </div>

          {/* Payment */}
          <div className="flex items-center gap-2">

            <CreditCard
              size={15}
              className="hidden text-slate-400 sm:block"
            />

            <Select
              aria-label="Payment method"
              value={method}
              placeholder="All payments"
              onChange={(e) =>
                setMethod(e.target.value)
              }
              options={[
                'CASH',
                'CARD',
                'UPI',
                'BANK_TRANSFER',
                'OTHER',
              ].map((v) => ({
                value: v,
                label: v,
              }))}
            />

          </div>

          {/* Status */}
          <div className="flex items-center gap-2">

            <Filter
              size={15}
              className="hidden text-slate-400 sm:block"
            />

            <Select
              aria-label="Status"
              value={status}
              placeholder="All statuses"
              onChange={(e) =>
                setStatus(e.target.value)
              }
              options={[
                'COMPLETED',
                'CANCELLED',
                'REFUNDED',
              ].map((v) => ({
                value: v,
                label: v,
              }))}
            />

          </div>

        </div>

        {/* Active filters */}
        {(search || method || status) && (
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-indigo-50/40 px-4 py-3">

            <span className="text-xs font-bold text-slate-500">
              Active filters:
            </span>

            {search && (
              <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-indigo-600 shadow-sm">
                Search: {search}
              </span>
            )}

            {method && (
              <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-indigo-600 shadow-sm">
                Payment: {method}
              </span>
            )}

            {status && (
              <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-indigo-600 shadow-sm">
                Status: {status}
              </span>
            )}

          </div>
        )}

        {/* ===================================================
            CONTENT
        =================================================== */}

        {loading ? (

          <div className="flex min-h-[300px] items-center justify-center">
            <Spinner text="Loading sales..." />
          </div>

        ) : error ? (

          <div className="p-5">
            <ErrorMessage
              message={error}
              onRetry={load}
            />
          </div>

        ) : rows.length === 0 ? (

          <div className="py-12">
            <EmptyState
              title="No sales found"
              text="No sales match your current search or filters."
            />
          </div>

        ) : (

          <>

            {/* Desktop/table */}
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                rows={rows}
              />
            </div>

            {/* Pagination */}
            <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3">
              <Pagination
                page={page}
                count={count}
                onChange={setPage}
              />
            </div>

          </>

        )}

      </Card>

      {/* =====================================================
          FOOTER INFORMATION
      ===================================================== */}

      <div
        className="
          flex
          flex-col
          gap-3
          rounded-2xl
          border
          border-indigo-100
          bg-indigo-50
          p-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-white
              text-indigo-600
              shadow-sm
            "
          >
            <Receipt size={17} />
          </div>

          <div>

            <p className="text-sm font-bold text-indigo-900">
              Sales overview
            </p>

            <p className="text-xs text-indigo-700">
              Review transaction details and open any invoice
              for the complete sale record.
            </p>

          </div>

        </div>

        <span className="text-xs font-semibold text-indigo-500">
          {count} total record{count === 1 ? '' : 's'}
        </span>

      </div>

    </div>
  );
}