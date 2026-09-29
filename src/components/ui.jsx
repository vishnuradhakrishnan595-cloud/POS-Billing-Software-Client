import { useEffect } from 'react';
import { Loader2, X, Inbox, ChevronLeft, ChevronRight } from 'lucide-react';

export function Button({ variant = 'primary', loading, className = '', children, ...p }) {
  const v = { primary: 'bg-brand text-white hover:bg-brand-dark', secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-700', success: 'bg-emerald-600 text-white hover:bg-emerald-700', ghost: 'text-slate-600 hover:bg-slate-100' }[variant];
  return (
    <button {...p} disabled={p.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand/40 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 ${v} ${className}`}>
      {loading && <Loader2 size={16} className="animate-spin" />}{children}
    </button>
  );
}
const field = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';
export function Input({ label, error, id, ...p }) {
  const i = id || `f-${label}`;
  return (<div><label htmlFor={i} className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
    <input id={i} className={field} {...p} />{error && <p className="mt-1 text-xs text-red-600">{error}</p>}</div>);
}
export function Select({ label, error, options = [], placeholder, id, ...p }) {
  const i = id || `f-${label}`;
  return (<div>{label && <label htmlFor={i} className="mb-1 block text-sm font-medium text-slate-700">{label}</label>}
    <select id={i} className={field} {...p}>{placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}</div>);
}
const tones = { green: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700', red: 'bg-red-50 text-red-700', blue: 'bg-blue-50 text-blue-700', gray: 'bg-slate-100 text-slate-600' };
export const Badge = ({ tone = 'gray', children }) => <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
export const Spinner = ({ text = 'Loading...' }) => <div className="flex items-center justify-center gap-2 py-16 text-slate-500"><Loader2 className="animate-spin" size={20} />{text}</div>;
export const ErrorMessage = ({ message, onRetry }) => (
  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{message}{onRetry && <button onClick={onRetry} className="ml-3 font-medium underline">Retry</button>}</div>);
export const EmptyState = ({ title = 'Nothing here yet', text, action }) => (
  <div className="flex flex-col items-center gap-2 py-14 text-center"><Inbox className="text-slate-300" size={40} /><p className="font-semibold">{title}</p>{text && <p className="text-sm text-slate-500">{text}</p>}{action}</div>);
export const Card = ({ className = '', children }) => <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>;

export function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => { if (!open) return; const h = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'}`}>
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"><X size={20} /></button></div>
        {children}
      </div>
    </div>
  );
}
export const ConfirmDialog = ({ open, title, message = 'This action cannot be undone.', onCancel, onConfirm, loading }) => (
  <Modal open={open} onClose={onCancel} title={title}><p className="text-sm text-slate-600">{message}</p>
    <div className="mt-5 flex justify-end gap-2"><Button variant="secondary" onClick={onCancel}>Cancel</Button><Button variant="danger" loading={loading} onClick={onConfirm}>Delete</Button></div></Modal>);

export function Pagination({ page, count, pageSize = 20, onChange }) {
  const pages = Math.max(1, Math.ceil(count / pageSize));
  if (pages <= 1) return null;
  return (<div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
    <span>Page {page} of {pages} · {count} total</span>
    <div className="flex gap-1"><Button variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft size={16} /></Button>
      <Button variant="secondary" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight size={16} /></Button></div></div>);
}
export function Table({ columns, rows, rowKey = 'id' }) {
  return (<div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm">
    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{columns.map((c) => <th key={c.label} className="px-4 py-3 font-medium">{c.label}</th>)}</tr></thead>
    <tbody className="divide-y divide-slate-100">{rows.map((r) => <tr key={r[rowKey]} className="hover:bg-slate-50">{columns.map((c) => <td key={c.label} className="px-4 py-3">{c.render ? c.render(r) : r[c.key]}</td>)}</tr>)}</tbody>
  </table></div>);
}
export const PageHeader = ({ title, subtitle, children }) => (
  <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">{title}</h1>{subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}</div><div className="flex gap-2">{children}</div></div>);
