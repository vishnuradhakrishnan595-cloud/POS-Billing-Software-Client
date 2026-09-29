import { fmtDate, money } from '../utils/format.js';
export default function Invoice({ sale }) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm print:border-0 print:shadow-none">
      <div className="border-b-2 border-slate-900 pb-3 text-center"><h2 className="text-xl font-bold">POS SYSTEM</h2><p className="text-sm text-slate-500">Sales Invoice</p></div>
      <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm">
        <div><p><b>Invoice:</b> {sale.invoice_number}</p><p><b>Date:</b> {fmtDate(sale.created_at)}</p><p><b>Cashier:</b> {sale.cashier_name}</p></div>
        <div className="sm:text-right"><p className="font-semibold">Customer</p><p>{sale.customer_name || 'Walk-in customer'}</p></div>
      </div>
      <div className="mt-5 overflow-x-auto"><table className="w-full text-sm">
        <thead><tr className="border-y border-slate-300 text-left"><th className="py-2">Product</th><th>Qty</th><th className="text-right">Price</th><th className="text-right">Total</th></tr></thead>
        <tbody>{sale.items?.map((i) => <tr key={i.id} className="border-b border-slate-100"><td className="py-2">{i.product_name}</td><td>{i.quantity}</td><td className="text-right">{money(i.unit_price)}</td><td className="text-right">{money(i.total)}</td></tr>)}</tbody></table></div>
      <div className="ml-auto mt-4 max-w-xs space-y-1 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{money(sale.subtotal)}</span></div>
        <div className="flex justify-between"><span>Tax</span><span>{money(sale.tax_amount)}</span></div>
        <div className="flex justify-between"><span>Discount</span><span>-{money(sale.discount_amount)}</span></div>
        <div className="flex justify-between border-t-2 border-slate-900 pt-2 text-base font-bold"><span>TOTAL</span><span>{money(sale.total_amount)}</span></div></div>
      <p className="mt-5 text-sm">Payment: {sale.payment_method} ({sale.payment_status})</p>
      <p className="mt-4 text-center text-sm text-slate-500">Thank you for your purchase.</p>
    </div>
  );
}
