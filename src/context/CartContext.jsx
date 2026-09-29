import { createContext, useContext, useEffect, useMemo, useState } from 'react';
const Ctx = createContext(null);
export const useCart = () => useContext(Ctx);
const KEY = 'pos_cart'; // sessionStorage: survives navigation, not a closed tab
const EMPTY = { items: [], discount: 0, customer: '' };
const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) || EMPTY; } catch { return EMPTY; } };
export function CartProvider({ children }) {
  const [state, setState] = useState(load);
  useEffect(() => sessionStorage.setItem(KEY, JSON.stringify(state)), [state]);
  const set = (fn) => setState((s) => ({ ...s, ...fn(s) }));
  const add = (p) => set((s) => {
    if (s.items.some((i) => i.product.id === p.id)) return { items: s.items.map((i) => (i.product.id === p.id ? { ...i, quantity: Math.min(i.quantity + 1, p.stock_quantity) } : i)) };
    return { items: [...s.items, { product: p, quantity: 1 }] };
  });
  const setQty = (id, q) => set((s) => ({ items: s.items.flatMap((i) => {
    if (i.product.id !== id) return [i];
    const n = Math.min(q, i.product.stock_quantity);
    return n < 1 ? [] : [{ ...i, quantity: n }];
  }) }));
  const totals = useMemo(() => { // display estimate only — the backend computes the final figures
    const subtotal = state.items.reduce((a, i) => a + Number(i.product.selling_price) * i.quantity, 0);
    const tax = state.items.reduce((a, i) => a + (Number(i.product.selling_price) * i.quantity * Number(i.product.tax_percentage || 0)) / 100, 0);
    const discount = Math.min(Number(state.discount) || 0, subtotal + tax);
    return { subtotal, tax, discount, total: subtotal + tax - discount };
  }, [state]);
  const value = { ...state, totals, add, setQty, remove: (id) => setQty(id, 0), clear: () => setState(EMPTY),
    setDiscount: (d) => set(() => ({ discount: d })), setCustomer: (c) => set(() => ({ customer: c })) };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
