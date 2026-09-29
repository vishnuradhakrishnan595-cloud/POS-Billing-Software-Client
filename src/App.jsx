import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
export default function App() {
  return <ToastProvider><AuthProvider><CartProvider><AppRoutes /></CartProvider></AuthProvider></ToastProvider>;
}
