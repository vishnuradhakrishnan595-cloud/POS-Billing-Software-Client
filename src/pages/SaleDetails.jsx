import { useEffect, useState } from 'react';
import {
  Link,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import {
  ArrowLeft,
  Printer,
  Receipt,
  CheckCircle2,
  Clock3,
  XCircle,
  FileText,
  ShieldCheck,
} from 'lucide-react';

import { salesService } from '../services/index.js';
import Invoice from '../components/Invoice.jsx';

import {
  Badge,
  Button,
  Card,
  ErrorMessage,
  Spinner,
} from '../components/ui.jsx';

import { getApiErrorMessage } from '../utils/format.js';

export default function SaleDetails() {
  const { id } = useParams();
  const [sp] = useSearchParams();

  const [sale, setSale] = useState(null);
  const [error, setError] = useState('');

  // =========================================================
  // LOAD SALE
  // =========================================================

  useEffect(() => {
    salesService
      .getSale(id)
      .then(setSale)
      .catch((e) =>
        setError(getApiErrorMessage(e))
      );
  }, [id]);

  // =========================================================
  // AUTO PRINT
  // =========================================================

  useEffect(() => {
    if (sale && sp.get('print')) {
      const timer = setTimeout(() => {
        window.print();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [sale, sp]);

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="space-y-4">
        <div className="no-print">
          <Link
            to="/sales"
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2
              text-sm
              font-semibold
              text-slate-600
              shadow-sm
              transition
              hover:border-indigo-200
              hover:text-indigo-600
            "
          >
            <ArrowLeft size={16} />
            Back to Sales
          </Link>
        </div>

        <ErrorMessage message={error} />
      </div>
    );
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (!sale) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner text="Loading sale..." />
      </div>
    );
  }

  // =========================================================
  // SALE STATUS
  // =========================================================

  const status =
    sale.sale_status || 'UNKNOWN';

  const isCompleted =
    status === 'COMPLETED';

  const isPending =
    status === 'PENDING';

  const isCancelled =
    status === 'CANCELLED';

  const statusTone = isCompleted
    ? 'green'
    : isPending
    ? 'amber'
    : 'red';

  const StatusIcon = isCompleted
    ? CheckCircle2
    : isPending
    ? Clock3
    : XCircle;

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="space-y-5">

      {/* =====================================================
          PREMIUM HEADER
      ===================================================== */}

      <div
        className="
          no-print
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

          {/* Title */}
          <div>

            <div className="mb-2 flex items-center gap-2 text-indigo-300">

              <Receipt size={18} />

              <span className="text-xs font-bold uppercase tracking-[0.18em]">
                Sales Management
              </span>

            </div>

            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Sale Details
            </h1>

            <p className="mt-2 text-sm text-indigo-200">
              View transaction information and print the
              customer invoice.
            </p>

          </div>

          {/* Invoice Info */}
          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/10
              px-5
              py-4
              backdrop-blur
            "
          >

            <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-300">
              Invoice Number
            </p>

            <p className="mt-1 text-lg font-black text-white">
              {sale.invoice_number || `#${sale.id}`}
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          ACTION BAR
      ===================================================== */}

      <div className="no-print">

        <Card className="p-4">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            {/* Back */}
            <Link
              to="/sales"
              className="
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-2.5
                text-sm
                font-semibold
                text-slate-600
                transition
                hover:border-indigo-200
                hover:bg-indigo-50
                hover:text-indigo-600
              "
            >
              <ArrowLeft size={16} />
              Back to Sales
            </Link>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">

              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">

                <StatusIcon
                  size={16}
                  className={
                    isCompleted
                      ? 'text-emerald-600'
                      : isPending
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }
                />

                <Badge tone={statusTone}>
                  {status}
                </Badge>

              </div>

              <Button
                onClick={() => window.print()}
              >
                <Printer size={16} />
                Print Invoice
              </Button>

            </div>

          </div>

        </Card>

      </div>

      {/* =====================================================
          SALE SUMMARY
      ===================================================== */}

      <div className="no-print grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* Invoice */}
        <Card className="p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FileText size={20} />
            </div>

            <div className="min-w-0">

              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Invoice
              </p>

              <p className="mt-1 truncate text-sm font-bold text-slate-800">
                {sale.invoice_number || `#${sale.id}`}
              </p>

            </div>

          </div>

        </Card>

        {/* Payment */}
        <Card className="p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>

            <div>

              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Payment Method
              </p>

              <p className="mt-1 text-sm font-bold text-slate-800">
                {sale.payment_method || '—'}
              </p>

            </div>

          </div>

        </Card>

        {/* Status */}
        <Card className="p-5">

          <div className="flex items-center gap-3">

            <div
              className={`
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                ${
                  isCompleted
                    ? 'bg-emerald-50 text-emerald-600'
                    : isPending
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-red-50 text-red-600'
                }
              `}
            >
              <StatusIcon size={20} />
            </div>

            <div>

              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Sale Status
              </p>

              <div className="mt-1">
                <Badge tone={statusTone}>
                  {status}
                </Badge>
              </div>

            </div>

          </div>

        </Card>

      </div>

      {/* =====================================================
          INVOICE AREA
      ===================================================== */}

      <div>

        <Card className="overflow-hidden p-0">

          {/* Invoice Header */}
          <div
            className="
              no-print
              flex
              items-center
              justify-between
              border-b
              border-slate-100
              bg-slate-50/70
              px-5
              py-4
            "
          >

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Receipt size={19} />
              </div>

              <div>

                <h2 className="text-sm font-bold text-slate-900">
                  Customer Invoice
                </h2>

                <p className="text-xs text-slate-500">
                  Official transaction document
                </p>

              </div>

            </div>

            <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">

              <ShieldCheck size={15} />

              Secure Transaction

            </div>

          </div>

          {/* Existing Invoice Component */}
          <div className="p-4 sm:p-6">

            <Invoice sale={sale} />

          </div>

        </Card>

      </div>

      {/* =====================================================
          PRINT FOOTER
      ===================================================== */}

      <div className="no-print rounded-2xl border border-indigo-100 bg-indigo-50 p-4">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
            <Printer size={17} />
          </div>

          <div>

            <p className="text-sm font-bold text-indigo-900">
              Ready to Print
            </p>

            <p className="text-xs text-indigo-700">
              Use the Print Invoice button to generate a
              printable copy of this transaction.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}