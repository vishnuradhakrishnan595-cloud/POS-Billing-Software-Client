
import { useCallback, useEffect, useState } from 'react';

import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Package,
  Layers,
  Tag,
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

import {
  productService,
  categoryService,
  brandService,
  customerService,
  userService,
} from '../services/index.js';

import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

import useDebounce from '../hooks/useDebounce.js';

import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorMessage,
  Input,
  Modal,
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

import {
  canManageProducts,
  canManageUsers,
  canCreateSales,
} from '../utils/permissions.js';


// =========================================================
// COMMON HELPERS
// =========================================================

const active = (r) => (
  <Badge tone={r.is_active ? 'green' : 'gray'}>
    {r.is_active ? 'Active' : 'Inactive'}
  </Badge>
);


const opts = (svc) => () =>
  svc
    .list({ page_size: 100 })
    .then((d) =>
      toList(d).map((x) => ({
        value: x.id,
        label: x.name,
      }))
    );


const num = (name, label, extra = {}) => ({
  name,
  label,
  type: 'number',
  step: '0.01',
  min: 0,
  required: true,
  ...extra,
});


// =========================================================
// PAGE ICON
// =========================================================

const PAGE_ICONS = {
  products: Package,
  categories: Layers,
  brands: Tag,
  customers: Users,
  users: ShieldCheck,
};


// =========================================================
// CONFIGURATION
// =========================================================

const CONFIG = {

  // =======================================================
  // PRODUCTS
  // =======================================================

  products: {
    title: 'Products',
    singular: 'Product',
    service: productService,
    can: canManageProducts,

    columns: [
      {
        label: 'Product',
        render: (r) => (
          <div className="min-w-[160px]">
            <p className="font-semibold text-slate-800">
              {r.name}
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              {r.sku}
            </p>
          </div>
        ),
      },

      {
        label: 'Category',
        render: (r) => (
          <span className="text-slate-600">
            {r.category_name || '—'}
          </span>
        ),
      },

      {
        label: 'Price',
        render: (r) => (
          <span className="font-semibold text-slate-800">
            {money(r.selling_price)}
          </span>
        ),
      },

      {
        label: 'Stock',
        render: (r) => (
          <span
            className={
              r.is_low_stock
                ? 'font-bold text-amber-600'
                : 'font-medium text-slate-700'
            }
          >
            {r.stock_quantity} {r.unit}
          </span>
        ),
      },

      {
        label: 'Status',
        render: active,
      },
    ],

    fields: [
      {
        name: 'name',
        label: 'Name',
        required: true,
      },

      {
        name: 'sku',
        label: 'SKU',
        required: true,
      },

      {
        name: 'barcode',
        label: 'Barcode',
        nullable: true,
      },

      {
        name: 'category',
        label: 'Category',
        type: 'select',
        optionsFrom: opts(categoryService),
        nullable: true,
      },

      {
        name: 'brand',
        label: 'Brand',
        type: 'select',
        optionsFrom: opts(brandService),
        nullable: true,
      },

      num('cost_price', 'Cost Price'),

      num('selling_price', 'Selling Price'),

      num(
        'stock_quantity',
        'Stock Quantity',
        {
          step: '1',
        }
      ),

      num(
        'minimum_stock',
        'Minimum Stock',
        {
          step: '1',
        }
      ),

      {
        name: 'unit',
        label: 'Unit',
        type: 'select',
        options: [
          'PCS',
          'MTR',
          'KG',
          'LTR',
          'BOX',
          'PACK',
        ].map((v) => ({
          value: v,
          label: v,
        })),
        required: true,
      },

      num(
        'tax_percentage',
        'Tax %',
        {
          max: 100,
        }
      ),

      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
      },

      {
        name: 'is_active',
        label: 'Active',
        type: 'checkbox',
      },
    ],

    initial: {
      unit: 'PCS',
      is_active: true,
      tax_percentage: 0,
      cost_price: 0,
      stock_quantity: 0,
      minimum_stock: 0,
    },
  },


  // =======================================================
  // CATEGORIES
  // =======================================================

  categories: {
    title: 'Categories',
    singular: 'Category',
    service: categoryService,
    can: canManageProducts,

    columns: [
      {
        label: 'Name',
        render: (r) => (
          <span className="font-semibold text-slate-800">
            {r.name}
          </span>
        ),
      },

      {
        label: 'Description',
        render: (r) => (
          <span className="text-slate-600">
            {r.description || '—'}
          </span>
        ),
      },

      {
        label: 'Status',
        render: active,
      },
    ],

    fields: [
      {
        name: 'name',
        label: 'Name',
        required: true,
      },

      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
      },

      {
        name: 'is_active',
        label: 'Active',
        type: 'checkbox',
      },
    ],

    initial: {
      is_active: true,
    },
  },


  // =======================================================
  // BRANDS
  // =======================================================

  brands: {
    title: 'Brands',
    singular: 'Brand',
    service: brandService,
    can: canManageProducts,

    columns: [
      {
        label: 'Name',
        render: (r) => (
          <span className="font-semibold text-slate-800">
            {r.name}
          </span>
        ),
      },

      {
        label: 'Description',
        render: (r) => (
          <span className="text-slate-600">
            {r.description || '—'}
          </span>
        ),
      },

      {
        label: 'Status',
        render: active,
      },
    ],

    fields: [
      {
        name: 'name',
        label: 'Name',
        required: true,
      },

      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
      },

      {
        name: 'is_active',
        label: 'Active',
        type: 'checkbox',
      },
    ],

    initial: {
      is_active: true,
    },
  },


  // =======================================================
  // CUSTOMERS
  // =======================================================

  customers: {
    title: 'Customers',
    singular: 'Customer',
    service: customerService,
    can: canCreateSales,

    columns: [
      {
        label: 'Name',
        render: (r) => (
          <span className="font-semibold text-slate-800">
            {r.name}
          </span>
        ),
      },

      {
        label: 'Phone',
        render: (r) => (
          <span className="text-slate-600">
            {r.phone}
          </span>
        ),
      },

      {
        label: 'Email',
        render: (r) => (
          <span className="text-slate-600">
            {r.email || '—'}
          </span>
        ),
      },

      {
        label: 'City',
        render: (r) => (
          <span className="text-slate-600">
            {r.city || '—'}
          </span>
        ),
      },
    ],

    fields: [
      {
        name: 'name',
        label: 'Name',
        required: true,
      },

      {
        name: 'phone',
        label: 'Phone',
        required: true,
      },

      {
        name: 'email',
        label: 'Email',
        type: 'email',
      },

      {
        name: 'city',
        label: 'City',
      },

      {
        name: 'state',
        label: 'State',
      },

      {
        name: 'postal_code',
        label: 'Postal Code',
      },

      {
        name: 'address',
        label: 'Address',
        type: 'textarea',
      },
    ],

    initial: {},
  },


  // =======================================================
  // USERS
  // =======================================================

  users: {
    title: 'Users',
    singular: 'User',
    service: userService,
    can: canManageUsers,
    noSearchParam: false,

    columns: [
      {
        label: 'User',
        render: (r) => (
          <div className="min-w-[160px]">
            <p className="font-semibold text-slate-800">
              {r.first_name} {r.last_name}
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              @{r.username}
            </p>
          </div>
        ),
      },

      {
        label: 'Email',
        render: (r) => (
          <span className="text-slate-600">
            {r.email}
          </span>
        ),
      },

      {
        label: 'Role',
        render: (r) => (
          <Badge tone="blue">
            {r.role}
          </Badge>
        ),
      },

      {
        label: 'Status',
        render: active,
      },

      {
        label: 'Joined',
        render: (r) => (
          <span className="text-xs text-slate-500">
            {fmtDate(r.date_joined)}
          </span>
        ),
      },
    ],

    fields: [
      {
        name: 'username',
        label: 'Username',
        required: true,
      },

      {
        name: 'first_name',
        label: 'First Name',
      },

      {
        name: 'last_name',
        label: 'Last Name',
      },

      {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
      },

      {
        name: 'phone',
        label: 'Phone',
      },

      {
        name: 'role',
        label: 'Role',
        type: 'select',
        options: [
          'ADMIN',
          'MANAGER',
          'CASHIER',
          'STAFF',
        ].map((v) => ({
          value: v,
          label: v,
        })),
        required: true,
      },

      {
        name: 'password',
        label: 'Password',
        type: 'password',
        createOnly: true,
        required: true,
      },

      {
        name: 'is_active',
        label: 'Active',
        type: 'checkbox',
      },
    ],

    initial: {
      role: 'STAFF',
      is_active: true,
    },
  },
};


// =========================================================
// RECORD FORM
// =========================================================

function RecordForm({
  cfg,
  record,
  onSaved,
  onCancel,
}) {
  const toast = useToast();

  const editing = !!record;

  const fields = cfg.fields.filter(
    (f) => !(f.createOnly && editing)
  );

  const [v, setV] = useState(() => ({
    ...cfg.initial,
    ...(record || {}),
  }));

  const [dyn, setDyn] = useState({});
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);


  // =======================================================
  // LOAD DYNAMIC SELECT OPTIONS
  // =======================================================

  useEffect(() => {
    fields
      .filter((f) => f.optionsFrom)
      .forEach((f) => {
        f.optionsFrom()
          .then((options) => {
            setDyn((d) => ({
              ...d,
              [f.name]: options,
            }));
          })
          .catch(() => {});
      });
  }, []);


  // =======================================================
  // FORM SUBMIT
  // =======================================================

  const submit = async (e) => {
    e.preventDefault();

    const x = {};


    // -------------------------------------------------------
    // FIELD VALIDATION
    // -------------------------------------------------------

    fields.forEach((f) => {
      const val = v[f.name];

      if (
        f.required &&
        (
          val === '' ||
          val === undefined ||
          val === null
        )
      ) {
        x[f.name] = `${f.label} is required`;
      }

      else if (
        f.type === 'number' &&
        val !== '' &&
        val !== undefined
      ) {
        const n = Number(val);

        if (Number.isNaN(n) || n < 0) {
          x[f.name] = 'Must be 0 or more';
        }

        else if (
          f.max !== undefined &&
          n > f.max
        ) {
          x[f.name] = `Max ${f.max}`;
        }
      }

      if (
        f.type === 'email' &&
        val &&
        !/^\S+@\S+\.\S+$/.test(val)
      ) {
        x[f.name] = 'Invalid email';
      }
    });


    // -------------------------------------------------------
    // CUSTOMER PHONE VALIDATION
    // -------------------------------------------------------

    if (
      cfg.singular === 'Customer' &&
      v.phone &&
      !/^\+?[0-9\s-]{7,15}$/.test(v.phone)
    ) {
      x.phone = 'Invalid phone number';
    }


    setErr(x);

    if (Object.keys(x).length) {
      return;
    }


    // -------------------------------------------------------
    // BUILD REQUEST BODY
    // -------------------------------------------------------

    const body = {};

    fields.forEach((f) => {
      const val = v[f.name];

      if (val === undefined) {
        return;
      }

      body[f.name] =
        val === '' && f.nullable
          ? null
          : val;
    });


    // -------------------------------------------------------
    // API REQUEST
    // -------------------------------------------------------

    setBusy(true);

    try {
      if (editing) {
        await cfg.service.update(
          record.id,
          body
        );
      } else {
        await cfg.service.create(body);
      }

      toast.success(
        `${cfg.singular} ${
          editing ? 'updated' : 'created'
        } successfully`
      );

      onSaved();

    } catch (ex) {
      toast.error(
        getApiErrorMessage(ex)
      );
    } finally {
      setBusy(false);
    }
  };


  // =======================================================
  // FORM UI
  // =======================================================

  return (
    <form
      onSubmit={submit}
      className="grid gap-5 sm:grid-cols-2"
      noValidate
    >

      {fields.map((f) => {

        const common = {
          label: f.label,
          error: err[f.name],
        };

        const val = v[f.name] ?? '';

        const set = (value) => {
          setV({
            ...v,
            [f.name]: value,
          });
        };


        // ---------------------------------------------------
        // CHECKBOX
        // ---------------------------------------------------

        if (f.type === 'checkbox') {
          return (
            <div
              key={f.name}
              className="sm:col-span-2"
            >
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition-colors hover:bg-slate-100">

                <input
                  type="checkbox"
                  checked={!!v[f.name]}
                  onChange={(e) =>
                    set(e.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {f.label}
                  </p>

                  <p className="text-xs text-slate-400">
                    {v[f.name]
                      ? 'This option is enabled'
                      : 'This option is disabled'}
                  </p>
                </div>

              </label>
            </div>
          );
        }


        // ---------------------------------------------------
        // SELECT
        // ---------------------------------------------------

        if (f.type === 'select') {
          return (
            <Select
              key={f.name}
              {...common}
              value={val}
              placeholder={
                f.nullable
                  ? 'None'
                  : 'Select an option'
              }
              options={
                f.options ||
                dyn[f.name] ||
                []
              }
              onChange={(e) =>
                set(e.target.value)
              }
            />
          );
        }


        // ---------------------------------------------------
        // TEXTAREA
        // ---------------------------------------------------

        if (f.type === 'textarea') {
          return (
            <div
              key={f.name}
              className="sm:col-span-2"
            >

              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                {f.label}
              </label>

              <textarea
                rows={4}
                value={val}
                onChange={(e) =>
                  set(e.target.value)
                }
                className={`w-full resize-none rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                  err[f.name]
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
                placeholder={`Enter ${f.label.toLowerCase()}...`}
              />

              {err[f.name] && (
                <p className="mt-1 text-xs text-red-500">
                  {err[f.name]}
                </p>
              )}

            </div>
          );
        }


        // ---------------------------------------------------
        // NORMAL INPUT
        // ---------------------------------------------------

        return (
          <Input
            key={f.name}
            {...common}
            type={f.type || 'text'}
            step={f.step}
            min={f.min}
            max={f.max}
            value={val}
            onChange={(e) =>
              set(e.target.value)
            }
          />
        );
      })}


      {/* ---------------------------------------------------
          FORM ACTIONS
      --------------------------------------------------- */}

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 sm:col-span-2">

        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          loading={busy}
        >
          {editing ? (
            <>
              <CheckCircle2 size={16} />
              Save Changes
            </>
          ) : (
            <>
              <Plus size={16} />
              Add {cfg.singular}
            </>
          )}
        </Button>

      </div>

    </form>
  );
}


// =========================================================
// MANAGE PAGE
// =========================================================

export default function Manage({
  kind,
}) {
  const cfg = CONFIG[kind];

  const { user } = useAuth();
  const toast = useToast();

  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');

  const q = useDebounce(search);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(null);

  const [del, setDel] = useState(null);
  const [delBusy, setDelBusy] = useState(false);

  const can = cfg.can(user);

  const PageIcon =
    PAGE_ICONS[kind] || Package;


  // =======================================================
  // RESET WHEN RESOURCE CHANGES
  // =======================================================

  useEffect(() => {
    setPage(1);
    setSearch('');
    setEditing(null);
    setDel(null);
  }, [kind]);


  // =======================================================
  // LOAD DATA
  // =======================================================

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page,
      };

      if (!cfg.noSearchParam && q) {
        params.search = q;
      }

      const d = await cfg.service.list(params);

      const list = toList(d);

      setRows(list);

      setCount(
        d?.count ??
        list.length
      );

    } catch (e) {
      setError(
        getApiErrorMessage(e)
      );
    } finally {
      setLoading(false);
    }
  }, [
    cfg,
    page,
    q,
  ]);


  // =======================================================
  // INITIAL / FILTER LOAD
  // =======================================================

  useEffect(() => {
    load();
  }, [load]);


  // =======================================================
  // RESET PAGE WHEN SEARCH CHANGES
  // =======================================================

  useEffect(() => {
    setPage(1);
  }, [q]);


  // =======================================================
  // DELETE
  // =======================================================

  const confirmDelete = async () => {
    if (!del) {
      return;
    }

    setDelBusy(true);

    try {
      await cfg.service.remove(
        del.id
      );

      toast.success(
        `${cfg.singular} deleted`
      );

      setDel(null);

      await load();

    } catch (e) {
      toast.error(
        getApiErrorMessage(e)
      );

      setDel(null);
    } finally {
      setDelBusy(false);
    }
  };


  // =======================================================
  // ACTION COLUMN
  // =======================================================

  const columns = can
    ? [
        ...cfg.columns,

        {
          label: 'Actions',

          render: (r) => (
            <div className="flex items-center gap-1">

              <button
                type="button"
                aria-label={`Edit ${
                  r.name ||
                  r.username ||
                  'record'
                }`}
                onClick={() =>
                  setEditing(r)
                }
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
              >
                <Pencil size={16} />
              </button>

              <button
                type="button"
                aria-label={`Delete ${
                  r.name ||
                  r.username ||
                  'record'
                }`}
                onClick={() =>
                  setDel(r)
                }
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>

            </div>
          ),
        },
      ]
    : cfg.columns;


  // =======================================================
  // PAGE UI
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
                Management
              </span>

            </div>

            <div className="flex items-center gap-3">

              <div className="hidden h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur sm:flex">
                <PageIcon size={22} />
              </div>

              <div>

                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {cfg.title}
                </h1>

                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-300">
                  Manage your {cfg.title.toLowerCase()},
                  keep your records organized, and
                  maintain your business data.
                </p>

              </div>

            </div>

          </div>


          {can && (
            <Button
              onClick={() =>
                setEditing({})
              }
              className="border-0 bg-white text-slate-900 shadow-lg hover:bg-slate-100"
            >
              <Plus size={17} />
              Add {cfg.singular}
            </Button>
          )}

        </div>

      </div>


      {/* ===================================================
          SUMMARY
      =================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <Card className="border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <PageIcon size={19} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Total {cfg.title}
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {count}
              </p>
            </div>

          </div>

        </Card>


        <Card className="border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Current View
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {rows.length}
              </p>
            </div>

          </div>

        </Card>


        <Card className="hidden border border-slate-200 bg-white p-5 shadow-sm lg:block">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Search size={19} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Search
              </p>

              <p className="mt-1 text-sm font-bold text-slate-800">
                {q
                  ? `Filtering: ${q}`
                  : 'All records'}
              </p>
            </div>

          </div>

        </Card>

      </div>


      {/* ===================================================
          TABLE CARD
      =================================================== */}

      <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">


        {/* ---------------------------------------------------
            SEARCH BAR
        --------------------------------------------------- */}

        <div className="border-b border-slate-100 p-4 sm:p-5">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-base font-bold text-slate-900">
                {cfg.title} List
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                View and manage your {cfg.title.toLowerCase()}.
              </p>

            </div>


            <div className="relative w-full sm:w-80">

              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                aria-label={`Search ${cfg.title}`}
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder={`Search ${cfg.title.toLowerCase()}...`}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              />

            </div>

          </div>

        </div>


        {/* ---------------------------------------------------
            CONTENT
        --------------------------------------------------- */}

        {loading ? (

          <div className="flex min-h-[280px] items-center justify-center">
            <Spinner
              text={`Loading ${cfg.title.toLowerCase()}...`}
            />
          </div>

        ) : error ? (

          <div className="p-5">
            <ErrorMessage
              message={error}
              onRetry={load}
            />
          </div>

        ) : rows.length === 0 ? (

          <div className="p-8">

            <EmptyState
              title={`No ${cfg.title.toLowerCase()} found`}
              text={
                q
                  ? 'Nothing matches your search.'
                  : `No ${cfg.title.toLowerCase()} yet.`
              }
            />

          </div>

        ) : (

          <>
            <div className="overflow-x-auto">

              <Table
                columns={columns}
                rows={rows}
              />

            </div>

            <div className="border-t border-slate-100 px-4 py-3">
              <Pagination
                page={page}
                count={count}
                onChange={setPage}
              />
            </div>
          </>

        )}

      </Card>


      {/* ===================================================
          ADD / EDIT MODAL
      =================================================== */}

      <Modal
        open={!!editing}
        onClose={() =>
          setEditing(null)
        }
        wide
        title={
          editing?.id
            ? `Edit ${cfg.singular}`
            : `Add ${cfg.singular}`
        }
      >

        {editing && (
          <RecordForm
            cfg={cfg}
            record={
              editing.id
                ? editing
                : null
            }
            onCancel={() =>
              setEditing(null)
            }
            onSaved={() => {
              setEditing(null);
              load();
            }}
          />
        )}

      </Modal>


      {/* ===================================================
          DELETE CONFIRMATION
      =================================================== */}

      <ConfirmDialog
        open={!!del}
        title={`Delete ${cfg.singular}?`}
        loading={delBusy}
        onCancel={() =>
          setDel(null)
        }
        onConfirm={confirmDelete}
      />

    </div>
  );
}
