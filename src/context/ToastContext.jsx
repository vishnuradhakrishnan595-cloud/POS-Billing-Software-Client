import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
const Ctx = createContext(null);
export const useToast = () => useContext(Ctx);
const styles = { success: ['bg-emerald-600', CheckCircle2], error: ['bg-red-600', XCircle], warning: ['bg-amber-500', AlertTriangle] };
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((type, message) => {
    const id = Math.random();
    setItems((p) => [...p, { id, type, message }]);
    setTimeout(() => setItems((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const api = useMemo(() => ({ success: (m) => push('success', m), error: (m) => push('error', m), warning: (m) => push('warning', m) }), [push]);
  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="no-print fixed right-4 top-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2" role="status" aria-live="polite">
        {items.map((t) => { const [bg, Icon] = styles[t.type]; return (
          <div key={t.id} className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm text-white shadow-lg ${bg}`}><Icon size={18} className="mt-0.5 shrink-0" />{t.message}</div>); })}
      </div>
    </Ctx.Provider>
  );
}
