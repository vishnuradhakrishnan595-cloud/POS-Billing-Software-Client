import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  ShoppingCart,
  ScanBarcode,
  CreditCard,
  UserRound,
  Receipt,
  Sparkles,
  Package,
  AlertTriangle,
  X,
} from 'lucide-react';

import {
  productService,
  customerService,
  salesService,
} from '../services/index.js';

import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import useDebounce from '../hooks/useDebounce.js';

import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorMessage,
  Modal,
  Select,
  Spinner,
} from '../components/ui.jsx';

import {
  getApiErrorMessage,
  money,
  toList,
} from '../utils/format.js';

const METHODS = [
  ['CASH', 'Cash', '💵'],
  ['CARD', 'Card', '💳'],
  ['UPI', 'UPI', '📱'],
  ['BANK_TRANSFER', 'Bank Transfer', '🏦'],
  ['OTHER', 'Other', '•••'],
];

export default function POS() {
  const cart = useCart();
  const toast = useToast();
  const nav = useNavigate();

  const [search, setSearch] = useState('');
  const q = useDebounce(search, 300);
  const searchRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [customers, setCustomers] = useState([]);

  const [tab, setTab] = useState('products');
  const [payOpen, setPayOpen] = useState(false);
  const [method, setMethod] = useState('CASH');

  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await productService.list({
        search: q || undefined,
        is_active: true,
        page_size: 24,
      });

      setProducts(toList(data));
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    load();
  }, [load]);

  // =========================================================
  // LOAD CUSTOMERS
  // =========================================================

  useEffect(() => {
    customerService
      .list({ page_size: 100 })
      .then((data) => setCustomers(toList(data)))
      .catch(() => {});
  }, []);

  // =========================================================
  // KEYBOARD SHORTCUTS
  // =========================================================

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + K
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === 'k'
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }

      // Ctrl + Enter
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === 'Enter' &&
        cart.items.length
      ) {
        e.preventDefault();
        setPayOpen(true);
      }

      // Escape
      if (e.key === 'Escape') {
        if (payOpen) {
          setPayOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cart.items.length, payOpen]);

  // =========================================================
  // BARCODE / SKU ENTER
  // =========================================================

  const onEnter = (e) => {
    if (e.key !== 'Enter' || !search.trim()) {
      return;
    }

    const value = search.trim();

    const hit = products.find(
      (p) =>
        p.barcode === value ||
        p.sku?.toLowerCase() === value.toLowerCase()
    );

    if (hit && hit.stock_quantity > 0) {
      cart.add(hit);
      setSearch('');

      toast.success(`${hit.name} added to cart`);
    }
  };

  // =========================================================
  // COMPLETE SALE
  // =========================================================

  const complete = async () => {
    setBusy(true);

    try {
      const sale = await salesService.createSale({
        customer: cart.customer
          ? Number(cart.customer)
          : null,

        payment_method: method,

        discount_amount:
          Number(cart.discount) || 0,

        items: cart.items.map((item) => ({
          product: item.product.id,
          quantity: item.quantity,
        })),
      });

      setDone(sale);
      setPayOpen(false);

      cart.clear();

      load();

      toast.success('Sale completed successfully');
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const { totals } = cart;

  // =========================================================
  // PRODUCT GRID
  // =========================================================

  const productGrid = (
    <div className="space-y-4">

      {/* Search Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Products
            </h2>

            <p className="text-xs text-slate-500">
              Search products or scan a barcode
            </p>
          </div>

          <div className="hidden rounded-xl bg-indigo-50 p-2 text-indigo-600 sm:block">
            <ScanBarcode size={20} />
          </div>
        </div>

        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-3.5 text-slate-400"
          />

          <input
            ref={searchRef}
            aria-label="Search products or scan barcode"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={onEnter}
            placeholder="Search product / scan barcode..."
            className="
              w-full rounded-xl
              border border-slate-200
              bg-slate-50
              py-3 pl-11 pr-20
              text-sm text-slate-900
              placeholder:text-slate-400
              focus:border-indigo-500
              focus:bg-white
              focus:outline-none
              focus:ring-4
              focus:ring-indigo-500/10
            "
          />

          <span
            className="
              absolute right-3 top-2.5
              hidden rounded-lg
              border border-slate-200
              bg-white px-2 py-1
              text-[10px] font-semibold
              text-slate-400
              sm:block
            "
          >
            CTRL + K
          </span>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <Card className="flex min-h-[300px] items-center justify-center">
          <Spinner text="Loading products..." />
        </Card>
      )}

      {/* Error */}
      {!loading && error && (
        <ErrorMessage
          message={error}
          onRetry={load}
        />
      )}

      {/* Empty */}
      {!loading &&
        !error &&
        products.length === 0 && (
          <Card className="p-8">
            <EmptyState
              title="No products found"
              text="Try searching with another product name, SKU or barcode."
            />
          </Card>
        )}

      {/* Product Cards */}
      {!loading &&
        !error &&
        products.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">

            {products.map((p) => {
              const stock = Number(p.stock_quantity) || 0;
              const out = stock <= 0;

              const low =
                !out &&
                (
                  p.is_low_stock ||
                  stock <= Number(p.minimum_stock || 0)
                );

              return (
                <div
                  key={p.id}
                  className="
                    group flex flex-col
                    overflow-hidden
                    rounded-2xl
                    border border-slate-200
                    bg-white
                    shadow-sm
                    transition-all
                    duration-200
                    hover:-translate-y-1
                    hover:border-indigo-200
                    hover:shadow-xl
                  "
                >

                  {/* Product Top */}
                  <div className="p-4">

                    <div className="mb-3 flex items-start justify-between gap-2">

                      <div
                        className="
                          flex h-10 w-10
                          shrink-0 items-center
                          justify-center
                          rounded-xl
                          bg-gradient-to-br
                          from-indigo-500
                          to-violet-600
                          text-white
                          shadow-lg
                          shadow-indigo-500/20
                        "
                      >
                        <Package size={18} />
                      </div>

                      {out ? (
                        <Badge tone="red">
                          OUT
                        </Badge>
                      ) : low ? (
                        <Badge tone="amber">
                          LOW
                        </Badge>
                      ) : (
                        <Badge tone="green">
                          IN STOCK
                        </Badge>
                      )}
                    </div>

                    <h3
                      className="
                        min-h-[40px]
                        line-clamp-2
                        text-sm
                        font-bold
                        leading-5
                        text-slate-900
                      "
                    >
                      {p.name}
                    </h3>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {p.sku}
                      {p.category_name
                        ? ` · ${p.category_name}`
                        : ''}
                    </p>

                    <div className="mt-4 flex items-end justify-between gap-2">

                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          Selling Price
                        </p>

                        <p className="text-lg font-black text-indigo-600">
                          {money(p.selling_price)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">
                          Stock
                        </p>

                        <p
                          className={`text-sm font-bold ${
                            out
                              ? 'text-red-600'
                              : low
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {stock}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Add Button */}
                  <div className="mt-auto border-t border-slate-100 bg-slate-50 p-3">

                    <Button
                      className="w-full"
                      disabled={out}
                      onClick={() => {
                        cart.add(p);
                        toast.success(`${p.name} added to cart`);
                      }}
                    >
                      <Plus size={15} />
                      {out ? 'Out of Stock' : 'Add to Cart'}
                    </Button>

                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );

  // =========================================================
  // CART PANEL
  // =========================================================

  const cartPanel = (
    <div className="space-y-4">

      <Card className="overflow-hidden p-0 shadow-sm">

        {/* Cart Header */}
        <div
          className="
            bg-gradient-to-br
            from-slate-950
            via-indigo-950
            to-indigo-900
            p-5
            text-white
          "
        >
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <ShoppingCart size={20} />
              </div>

              <div>
                <h2 className="font-bold">
                  Current Cart
                </h2>

                <p className="text-xs text-indigo-200">
                  {cart.items.length}{' '}
                  {cart.items.length === 1
                    ? 'item'
                    : 'items'}{' '}
                  added
                </p>
              </div>

            </div>

            {cart.items.length > 0 && (
              <button
                onClick={cart.clear}
                className="
                  rounded-lg
                  p-2
                  text-indigo-200
                  transition
                  hover:bg-white/10
                  hover:text-white
                "
                title="Clear cart"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="p-4">

          {cart.items.length === 0 ? (
            <div className="py-10 text-center">

              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <ShoppingCart size={25} />
              </div>

              <p className="font-semibold text-slate-700">
                Cart is empty
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Add products to start a new sale.
              </p>
            </div>
          ) : (
            <ul className="max-h-[38vh] divide-y divide-slate-100 overflow-y-auto pr-1">

              {cart.items.map(
                ({ product: p, quantity }) => (
                  <li
                    key={p.id}
                    className="py-3"
                  >

                    <div className="flex gap-3">

                      <div
                        className="
                          flex h-9 w-9
                          shrink-0 items-center
                          justify-center
                          rounded-lg
                          bg-indigo-50
                          text-indigo-600
                        "
                      >
                        <Package size={16} />
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-semibold text-slate-800">
                          {p.name}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {money(p.selling_price)} each
                        </p>

                        <div className="mt-2 flex items-center justify-between gap-2">

                          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50">

                            <button
                              aria-label="Decrease quantity"
                              onClick={() =>
                                cart.setQty(
                                  p.id,
                                  quantity - 1
                                )
                              }
                              className="
                                p-1.5
                                text-slate-500
                                transition
                                hover:text-indigo-600
                              "
                            >
                              <Minus size={13} />
                            </button>

                            <span className="w-7 text-center text-xs font-bold text-slate-800">
                              {quantity}
                            </span>

                            <button
                              aria-label="Increase quantity"
                              disabled={
                                quantity >=
                                p.stock_quantity
                              }
                              onClick={() =>
                                cart.setQty(
                                  p.id,
                                  quantity + 1
                                )
                              }
                              className="
                                p-1.5
                                text-slate-500
                                transition
                                hover:text-indigo-600
                                disabled:cursor-not-allowed
                                disabled:opacity-30
                              "
                            >
                              <Plus size={13} />
                            </button>

                          </div>

                          <span className="text-sm font-bold text-slate-900">
                            {money(
                              Number(
                                p.selling_price
                              ) * quantity
                            )}
                          </span>

                        </div>
                      </div>

                      <button
                        aria-label={`Remove ${p.name}`}
                        onClick={() =>
                          cart.remove(p.id)
                        }
                        className="
                          self-start
                          rounded-lg
                          p-1.5
                          text-slate-400
                          transition
                          hover:bg-red-50
                          hover:text-red-500
                        "
                      >
                        <Trash2 size={15} />
                      </button>

                    </div>
                  </li>
                )
              )}

            </ul>
          )}

          {/* Cart Details */}
          {cart.items.length > 0 && (
            <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">

              {/* Customer */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <UserRound size={14} />
                  Customer
                </div>

                <Select
                  value={cart.customer}
                  placeholder="Walk-in customer"
                  onChange={(e) =>
                    cart.setCustomer(
                      e.target.value
                    )
                  }
                  options={customers.map((c) => ({
                    value: c.id,
                    label: `${c.name} · ${c.phone}`,
                  }))}
                />
              </div>

              {/* Discount */}
              <div>

                <label
                  htmlFor="disc"
                  className="
                    mb-2
                    block
                    text-xs
                    font-bold
                    uppercase
                    tracking-wide
                    text-slate-500
                  "
                >
                  Discount
                </label>

                <div className="relative">

                  <span className="absolute left-3 top-2.5 text-sm text-slate-400">
                    ₹
                  </span>

                  <input
                    id="disc"
                    type="number"
                    min="0"
                    step="0.01"
                    value={cart.discount || ''}
                    onChange={(e) =>
                      cart.setDiscount(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border border-slate-200
                      bg-slate-50
                      py-2.5 pl-8 pr-3
                      text-sm
                      focus:border-indigo-500
                      focus:bg-white
                      focus:outline-none
                      focus:ring-4
                      focus:ring-indigo-500/10
                    "
                    placeholder="0.00"
                  />

                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 rounded-xl bg-slate-50 p-4">

                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-700">
                    {money(totals.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-slate-500">
                  <span>Tax (est.)</span>
                  <span className="font-medium text-slate-700">
                    {money(totals.tax)}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-slate-500">
                  <span>Discount</span>
                  <span className="font-medium text-red-500">
                    -{money(totals.discount)}
                  </span>
                </div>

                <div
                  className="
                    mt-2
                    flex
                    items-center
                    justify-between
                    border-t
                    border-slate-200
                    pt-3
                  "
                >
                  <span className="font-bold text-slate-900">
                    Total
                  </span>

                  <span className="text-2xl font-black text-indigo-600">
                    {money(totals.total)}
                  </span>
                </div>

              </div>

              {/* Checkout */}
              <Button
                className="w-full py-3"
                disabled={!cart.items.length}
                onClick={() => setPayOpen(true)}
              >
                <CreditCard size={17} />
                Proceed to Payment
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={cart.clear}
              >
                Clear Cart
              </Button>

            </div>
          )}
        </div>
      </Card>

      {/* Keyboard Hint */}
      {cart.items.length > 0 && (
        <div className="hidden rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-700 lg:block">
          <div className="flex items-center gap-2">
            <Sparkles size={14} />
            <span>
              Press <strong>Ctrl + Enter</strong> to open
              payment.
            </span>
          </div>
        </div>
      )}
    </div>
  );

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="space-y-5">

      {/* Premium Header */}
      <div
        className="
          overflow-hidden
          rounded-3xl
          bg-gradient-to-br
          from-slate-950
          via-indigo-950
          to-indigo-900
          p-5
          text-white
          shadow-xl
          shadow-indigo-900/10
          sm:p-7
        "
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2 text-indigo-300">
              <Receipt size={18} />
              <span className="text-xs font-bold uppercase tracking-[0.18em]">
                Point of Sale
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              New Sale
            </h1>

            <p className="mt-1 max-w-xl text-sm text-indigo-200">
              Select products, manage the cart and complete
              your customer transaction quickly.
            </p>

          </div>

          <div className="flex items-center gap-3">

            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-300">
                Cart Items
              </p>

              <p className="mt-1 text-xl font-black">
                {cart.items.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-300">
                Total
              </p>

              <p className="mt-1 text-xl font-black">
                {money(totals.total)}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div
        className="grid grid-cols-2 gap-2 lg:hidden"
        role="tablist"
      >

        <button
          role="tab"
          aria-selected={tab === 'products'}
          onClick={() => setTab('products')}
          className={`
            flex items-center
            justify-center gap-2
            rounded-xl
            border
            py-3
            text-sm
            font-bold
            transition
            ${
              tab === 'products'
                ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'border-slate-200 bg-white text-slate-600'
            }
          `}
        >
          <Package size={16} />
          Products
        </button>

        <button
          role="tab"
          aria-selected={tab === 'cart'}
          onClick={() => setTab('cart')}
          className={`
            flex items-center
            justify-center gap-2
            rounded-xl
            border
            py-3
            text-sm
            font-bold
            transition
            ${
              tab === 'cart'
                ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'border-slate-200 bg-white text-slate-600'
            }
          `}
        >
          <ShoppingCart size={16} />
          Cart ({cart.items.length})
        </button>

      </div>

      {/* Main POS */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">

        <div
          className={
            tab === 'products'
              ? ''
              : 'hidden lg:block'
          }
        >
          {productGrid}
        </div>

        <div
          className={
            tab === 'cart'
              ? ''
              : 'hidden lg:block'
          }
        >
          {cartPanel}
        </div>

      </div>

      {/* =====================================================
          PAYMENT MODAL
      ===================================================== */}

      <Modal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title="Complete Payment"
      >
        <div className="space-y-5">

          {/* Amount */}
          <div
            className="
              rounded-2xl
              bg-gradient-to-br
              from-indigo-600
              to-violet-700
              p-5
              text-white
              shadow-lg
              shadow-indigo-500/20
            "
          >
            <div className="flex items-center gap-2 text-indigo-200">
              <CreditCard size={16} />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Amount to Collect
              </span>
            </div>

            <p className="mt-2 text-4xl font-black">
              {money(totals.total)}
            </p>

            <p className="mt-1 text-xs text-indigo-200">
              Final tax and total are calculated by the
              server.
            </p>
          </div>

          {/* Payment Method */}
          <div>

            <div className="mb-3 flex items-center gap-2">
              <CreditCard
                size={16}
                className="text-indigo-600"
              />

              <h3 className="text-sm font-bold text-slate-900">
                Payment Method
              </h3>
            </div>

            <div
              className="grid grid-cols-2 gap-3"
              role="radiogroup"
              aria-label="Payment method"
            >

              {METHODS.map(([value, label, icon]) => (
                <button
                  key={value}
                  role="radio"
                  aria-checked={method === value}
                  onClick={() => setMethod(value)}
                  className={`
                    rounded-2xl
                    border
                    p-4
                    text-left
                    transition-all
                    ${
                      method === value
                        ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-500/10'
                        : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50'
                    }
                  `}
                >

                  <div className="flex items-center justify-between">

                    <span className="text-xl">
                      {icon}
                    </span>

                    {method === value && (
                      <CheckCircle2
                        size={17}
                        className="text-indigo-600"
                      />
                    )}

                  </div>

                  <p
                    className={`
                      mt-3
                      text-sm
                      font-bold
                      ${
                        method === value
                          ? 'text-indigo-700'
                          : 'text-slate-700'
                      }
                    `}
                  >
                    {label}
                  </p>

                </button>
              ))}

            </div>
          </div>

          {/* Notice */}
          <div className="flex gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800">

            <AlertTriangle
              size={16}
              className="mt-0.5 shrink-0"
            />

            <p>
              The final tax and total amount will be
              calculated and validated by the server when
              the sale is completed.
            </p>

          </div>

          {/* Complete */}
          <Button
            variant="success"
            loading={busy}
            className="w-full py-3"
            onClick={complete}
          >
            <CheckCircle2 size={17} />
            Complete Sale
          </Button>

        </div>
      </Modal>

      {/* =====================================================
          SALE COMPLETED MODAL
      ===================================================== */}

      <Modal
        open={!!done}
        onClose={() => setDone(null)}
        title="Sale Completed"
      >
        {done && (
          <div className="text-center">

            {/* Success Icon */}
            <div
              className="
                mx-auto
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-full
                bg-emerald-50
                text-emerald-600
                shadow-lg
                shadow-emerald-500/10
              "
            >
              <CheckCircle2 size={44} />
            </div>

            <p className="mt-5 text-xl font-black text-slate-900">
              Payment Successful
            </p>

            <p className="mt-1 text-sm text-slate-500">
              The sale has been successfully recorded.
            </p>

            {/* Invoice */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Invoice
                  </p>

                  <p className="mt-1 break-all text-sm font-bold text-slate-800">
                    {done.invoice_number}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Payment
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {done.payment_method}
                  </p>
                </div>

              </div>

              <div className="mt-4 border-t border-slate-200 pt-4">

                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Total Amount
                </p>

                <p className="mt-1 text-3xl font-black text-indigo-600">
                  {money(done.total_amount)}
                </p>

              </div>

            </div>

            {/* Actions */}
            <div className="mt-5 grid gap-2">

              <Button
                onClick={() =>
                  nav(
                    `/sales/${done.id}?print=1`
                  )
                }
              >
                <Receipt size={16} />
                View / Print Invoice
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  setDone(null);
                  setSearch('');
                  setTab('products');

                  setTimeout(() => {
                    searchRef.current?.focus();
                  }, 100);
                }}
              >
                <Plus size={16} />
                Start New Sale
              </Button>

            </div>

          </div>
        )}
      </Modal>

    </div>
  );
}