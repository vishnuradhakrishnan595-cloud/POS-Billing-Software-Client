const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
export const money = (v) => inr.format(Number(v || 0));
export const fmtDate = (d) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
export const unwrap = (res) => (res?.data && typeof res.data === 'object' && 'success' in res.data && 'data' in res.data ? res.data.data : res.data);
export const toList = (data) => (Array.isArray(data) ? data : data?.results ?? data?.data ?? []);
export function getApiErrorMessage(error) {
  const d = error?.response?.data;
  if (!error?.response) return 'Cannot reach the server. Is the Django backend running?';
  if (typeof d === 'string') return d.length > 200 ? 'Server error' : d;
  const errs = d?.errors && Object.keys(d.errors).length ? d.errors : (d && !d.message && !d.detail ? d : null);
  if (errs) {
    const parts = Object.entries(errs).map(([k, v]) => {
      const msg = Array.isArray(v) ? v.join(' ') : typeof v === 'object' ? JSON.stringify(v) : String(v);
      return ['non_field_errors', 'detail'].includes(k) ? msg : `${k.replace(/_/g, ' ')}: ${msg}`;
    });
    if (parts.length) return d?.message && d.message !== 'Validation failed' ? `${d.message} — ${parts.join('; ')}` : parts.join('; ');
  }
  return d?.message || d?.detail || error.message || 'Something went wrong';
}
