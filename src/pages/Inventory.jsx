
import { useCallback, useEffect, useState } from 'react';

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Boxes,
  ClipboardList,
  Package,
  Plus,
  RefreshCw,
  ShieldAlert,
  Warehouse,
} from 'lucide-react';

import {
  inventoryService,
  productService,
} from '../services/index.js';

import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorMessage,
  Input,
  Modal,
  PageHeader,
  Select,
  Spinner,
  Table,
} from '../components/ui.jsx';

import {
  fmtDate,
  getApiErrorMessage,
  toList,
} from '../utils/format.js';

import {
  canManageProducts,
} from '../utils/permissions.js';


// =========================================================
// STAT CARD
// =========================================================

const InventoryStat = ({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
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
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
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
  icon: Icon,
  title,
  subtitle,
  action,
}) => (
  <div className="flex items-center justify-between gap-4">

    <div className="flex items-center gap-3">

      {Icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon size={19} />
        </div>
      )}

      <div>
        <h2 className="text-base font-bold text-slate-900">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500">
            {subtitle}
          </p>
        )}
      </div>

    </div>

    {action}

  </div>
);


// =========================================================
// STOCK ADJUSTMENT MODAL
// =========================================================

function AdjustModal({
  open,
  onClose,
  onDone,
  products,
}) {
  const toast = useToast();

  const [f, setF] = useState({
    product: '',
    quantity: '',
    reason: '',
  });

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState({});


  // =======================================================
  // SUBMIT STOCK ADJUSTMENT
  // =======================================================

  const submit = async (e) => {
    e.preventDefault();

    const v = {};

    if (!f.product) {
      v.product = 'Select a product';
    }

    if (
      !f.quantity ||
      Number(f.quantity) === 0
    ) {
      v.quantity =
        'Enter a non-zero quantity (negative removes stock)';
    }

    if (!f.reason.trim()) {
      v.reason = 'Reason is required';
    }

    setErr(v);

    if (Object.keys(v).length) {
      return;
    }

    setBusy(true);

    try {
      await inventoryService.adjustStock({
        product: Number(f.product),
        quantity: Number(f.quantity),
        reason: f.reason,
      });

      toast.success('Stock updated successfully');

      setF({
        product: '',
        quantity: '',
        reason: '',
      });

      setErr({});

      onDone();
    } catch (x) {
      toast.error(getApiErrorMessage(x));
    } finally {
      setBusy(false);
    }
  };


  // =======================================================
  // MODAL
  // =======================================================

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Stock Adjustment"
    >

      <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50 p-4">

        <div className="flex gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
            <RefreshCw size={17} />
          </div>

          <div>
            <p className="text-sm font-semibold text-indigo-900">
              Update inventory quantity
            </p>

            <p className="mt-1 text-xs leading-5 text-indigo-700">
              Use a positive number to add stock or a negative
              number to remove stock.
            </p>
          </div>

        </div>

      </div>


      <form
        onSubmit={submit}
        className="space-y-4"
        noValidate
      >

        <Select
          label="Product"
          value={f.product}
          error={err.product}
          placeholder="Select product"
          options={products.map((p) => ({
            value: p.id,
            label: `${p.name} (${p.stock_quantity})`,
          }))}
          onChange={(e) =>
            setF({
              ...f,
              product: e.target.value,
            })
          }
        />


        <Input
          label="Quantity (+ add / − remove)"
          type="number"
          value={f.quantity}
          error={err.quantity}
          placeholder="Example: 10 or -5"
          onChange={(e) =>
            setF({
              ...f,
              quantity: e.target.value,
            })
          }
        />


        <Input
          label="Reason"
          value={f.reason}
          error={err.reason}
          placeholder="Enter reason for stock adjustment"
          onChange={(e) =>
            setF({
              ...f,
              reason: e.target.value,
            })
          }
        />


        <div className="flex justify-end gap-2 pt-2">

          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={busy}
          >
            <RefreshCw size={16} />
            Adjust Stock
          </Button>

        </div>

      </form>

    </Modal>
  );
}


// =========================================================
// INVENTORY PAGE
// =========================================================

export default function Inventory() {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [low, setLow] = useState([]);
  const [txns, setTxns] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const canAdjust = canManageProducts(user);


  // =======================================================
  // LOAD DATA
  // =======================================================

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [p, l] = await Promise.all([
        productService.list({
          page_size: 100,
        }),

        inventoryService.getLowStock(),
      ]);

      setProducts(toList(p));
      setLow(toList(l));

      if (canAdjust) {
        setTxns(
          toList(
            await inventoryService.getTransactions({
              ordering: '-created_at',
              page_size: 10,
            })
          )
        );
      } else {
        setTxns([]);
      }

    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [canAdjust]);


  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    load();
  }, [load]);


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner text="Loading inventory..." />
      </div>
    );
  }


  // =======================================================
  // ERROR
  // =======================================================

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={load}
      />
    );
  }


  // =======================================================
  // CALCULATIONS
  // =======================================================

  const units = products.reduce(
    (a, p) => a + Number(p.stock_quantity || 0),
    0
  );

  const out = products.filter(
    (p) => Number(p.stock_quantity) === 0
  ).length;


  // =======================================================
  // TABLE COLUMNS
  // =======================================================

  const prodCols = [
    {
      label: 'Product',
      key: 'name',
    },

    {
      label: 'SKU',
      key: 'sku',
    },

    {
      label: 'Stock',
      render: (r) => (
        <span
          className={`font-bold ${
            r.stock_quantity === 0
              ? 'text-red-600'
              : r.is_low_stock
                ? 'text-amber-600'
                : 'text-slate-800'
          }`}
        >
          {r.stock_quantity}
        </span>
      ),
    },

    {
      label: 'Minimum',
      key: 'minimum_stock',
    },

    {
      label: 'Status',
      render: (r) =>
        r.stock_quantity === 0 ? (
          <Badge tone="red">
            Out
          </Badge>
        ) : r.is_low_stock ? (
          <Badge tone="amber">
            Low
          </Badge>
        ) : (
          <Badge tone="green">
            OK
          </Badge>
        ),
    },
  ];


  // =======================================================
  // PAGE
  // =======================================================

  return (
    <div className="min-h-full space-y-7 bg-slate-50/40">


      {/* ===================================================
          HERO HEADER
      =================================================== */}

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-900 p-6 shadow-xl sm:p-7">

        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />

        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="mb-3 flex items-center gap-2">

              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-200 backdrop-blur">
                Inventory Management
              </span>

            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Inventory Overview
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Track product stock, monitor low inventory, and
              manage stock adjustments from one place.
            </p>

          </div>


          {canAdjust && (
            <Button
              onClick={() => setOpen(true)}
              className="border-0 bg-white text-slate-900 shadow-lg hover:bg-slate-100"
            >
              <Plus size={17} />
              Stock Adjustment
            </Button>
          )}

        </div>

      </div>


      {/* ===================================================
          INVENTORY STATISTICS
      =================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <InventoryStat
          icon={Package}
          label="Total Products"
          value={products.length}
          description="Products in catalog"
          iconClass="bg-indigo-100 text-indigo-600"
        />

        <InventoryStat
          icon={Boxes}
          label="Total Stock Units"
          value={units}
          description="Available inventory units"
          iconClass="bg-blue-100 text-blue-600"
        />

        <InventoryStat
          icon={ShieldAlert}
          label="Low Stock"
          value={low.length}
          description="Products need attention"
          iconClass="bg-amber-100 text-amber-600"
          valueClass="text-amber-700"
        />

        <InventoryStat
          icon={AlertTriangle}
          label="Out of Stock"
          value={out}
          description="Products unavailable"
          iconClass="bg-red-100 text-red-600"
          valueClass="text-red-700"
        />

      </div>


      {/* ===================================================
          INVENTORY SUMMARY
      =================================================== */}

      <div className="grid gap-4 md:grid-cols-3">

        <Card className="border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Warehouse size={19} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Inventory Status
              </p>

              <p className="mt-1 text-sm font-bold text-slate-800">
                {out === 0
                  ? 'All products available'
                  : `${out} product${out > 1 ? 's' : ''} unavailable`}
              </p>
            </div>

          </div>

        </Card>


        <Card className="border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle size={19} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Attention Required
              </p>

              <p className="mt-1 text-sm font-bold text-slate-800">
                {low.length === 0
                  ? 'No low-stock items'
                  : `${low.length} low-stock item${low.length > 1 ? 's' : ''}`}
              </p>
            </div>

          </div>

        </Card>


        <Card className="border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Boxes size={19} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Available Units
              </p>

              <p className="mt-1 text-sm font-bold text-slate-800">
                {units.toLocaleString()}
              </p>
            </div>

          </div>

        </Card>

      </div>


      {/* ===================================================
          LOW STOCK
      =================================================== */}

      <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-4">

          <SectionHeader
            icon={AlertTriangle}
            title="Low Stock"
            subtitle="Products that require inventory attention"
            action={
              low.length > 0 && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  {low.length} item{low.length > 1 ? 's' : ''}
                </span>
              )
            }
          />

        </div>


        {low.length ? (

          <div className="overflow-x-auto">
            <Table
              columns={prodCols}
              rows={low}
            />
          </div>

        ) : (

          <div className="p-5">
            <EmptyState
              title="No low-stock products"
            />
          </div>

        )}

      </Card>


      {/* ===================================================
          CURRENT STOCK
      =================================================== */}

      <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-4">

          <SectionHeader
            icon={Package}
            title="Current Stock"
            subtitle="Complete inventory overview"
            action={
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {products.length} product{products.length !== 1 ? 's' : ''}
              </span>
            }
          />

        </div>


        {products.length ? (

          <div className="overflow-x-auto">
            <Table
              columns={prodCols}
              rows={products}
            />
          </div>

        ) : (

          <div className="p-5">
            <EmptyState
              title="No products"
            />
          </div>

        )}

      </Card>


      {/* ===================================================
          RECENT TRANSACTIONS
      =================================================== */}

      {canAdjust && (
        <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-4">

            <SectionHeader
              icon={ClipboardList}
              title="Recent Stock Transactions"
              subtitle="Latest inventory adjustments"
              action={
                txns.length > 0 && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Latest {txns.length}
                  </span>
                )
              }
            />

          </div>


          {txns.length ? (

            <div className="overflow-x-auto">

              <Table
                rows={txns}
                columns={[
                  {
                    label: 'Product',
                    key: 'product_name',
                  },

                  {
                    label: 'Type',
                    render: (r) => {
                      const type =
                        String(
                          r.transaction_type || ''
                        ).toLowerCase();

                      const isAdd =
                        type.includes('add') ||
                        type.includes('in') ||
                        Number(r.quantity) > 0;

                      return (
                        <div className="flex items-center gap-2">

                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                              isAdd
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {isAdd ? (
                              <ArrowUp size={14} />
                            ) : (
                              <ArrowDown size={14} />
                            )}
                          </span>

                          <span className="text-sm font-medium capitalize">
                            {r.transaction_type}
                          </span>

                        </div>
                      );
                    },
                  },

                  {
                    label: 'Change',
                    render: (r) => (
                      <span
                        className={`font-bold ${
                          Number(r.quantity) > 0
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }`}
                      >
                        {Number(r.quantity) > 0
                          ? `+${r.quantity}`
                          : r.quantity}
                      </span>
                    ),
                  },

                  {
                    label: 'New Qty',
                    render: (r) => (
                      <span className="font-semibold text-slate-800">
                        {r.new_quantity}
                      </span>
                    ),
                  },

                  {
                    label: 'Reason',
                    key: 'reason',
                  },

                  {
                    label: 'Date',
                    render: (r) => (
                      <span className="text-xs text-slate-500">
                        {fmtDate(r.created_at)}
                      </span>
                    ),
                  },
                ]}
              />

            </div>

          ) : (

            <div className="p-5">
              <EmptyState
                title="No transactions yet"
              />
            </div>

          )}

        </Card>
      )}


      {/* ===================================================
          STOCK ADJUSTMENT MODAL
      =================================================== */}

      <AdjustModal
        open={open}
        products={products}
        onClose={() => setOpen(false)}
        onDone={() => {
          setOpen(false);
          load();
        }}
      />

    </div>
  );
}
