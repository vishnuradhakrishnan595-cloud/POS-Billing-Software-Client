# POS Client (React + Vite + Tailwind)

Frontend for the Django POS backend in `D:\POS\Server`. Every screen talks to the real API; no mock data.

## Run (Windows)
Terminal 1 — Django:
```cmd
cd /d D:\POS\Server
env\Scripts\activate
python manage.py runserver
```
Terminal 2 — React:
```cmd
cd /d D:\POS\Client
npm install
npm run dev
```
Open http://localhost:5173. Other scripts: `npm run build`, `npm run preview`.

## Config
`.env` → `VITE_API_BASE_URL=http://127.0.0.1:8000/api`. Django `CORS_ALLOWED_ORIGINS` must include `http://localhost:5173` and `http://127.0.0.1:5173`.

## Auth
Login returns `access`, `refresh`, `user` (stored in localStorage). On a 401 the axios interceptor makes one shared refresh call to `/accounts/token/refresh/`, retries the request, and logs out if the refresh fails.

## Roles (mirrors backend permissions)
- ADMIN: everything · MANAGER: everything except Users
- CASHIER: Dashboard, POS, Sales, Products/Customers (read), Profile
- STAFF: Dashboard, Products (read), Inventory (read), Customers (read), Profile

## Notes
- The cart total is an estimate; the server computes tax, stock and totals and its response is what the invoice shows.
- Products, Categories, Brands, Customers and Users share one config-driven CRUD page (`src/pages/Manage.jsx`).
- Ctrl+K focuses POS search, Ctrl+Enter opens payment, Esc closes dialogs; USB barcode scanners work in the search box (Enter adds an exact barcode/SKU match).
