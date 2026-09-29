import { api } from './api.js';
import { unwrap } from '../utils/format.js';

const crud = (path) => ({
  list: (params) => api.get(`${path}/`, { params }).then((r) => r.data),
  get: (id) => api.get(`${path}/${id}/`).then(unwrap),
  create: (d) => api.post(`${path}/`, d).then(unwrap),
  update: (id, d) => api.patch(`${path}/${id}/`, d).then(unwrap),
  remove: (id) => api.delete(`${path}/${id}/`),
});

export const productService = crud('/inventory/products');
export const categoryService = crud('/inventory/categories');
export const brandService = crud('/inventory/brands');
export const userService = crud('/accounts/users');
export const customerService = crud('/sales/customers');
export const inventoryService = {
  adjustStock: (d) => api.post('/inventory/stock/adjust/', d).then(unwrap),
  getLowStock: () => api.get('/inventory/low-stock/').then((r) => r.data),
  getTransactions: (params) => api.get('/inventory/stock/', { params }).then((r) => r.data),
};
export const salesService = {
  getSales: (params) => api.get('/sales/', { params }).then((r) => r.data),
  getSale: (id) => api.get(`/sales/${id}/`).then((r) => r.data),
  createSale: (d) => api.post('/sales/', d).then(unwrap),
  getRecentSales: (limit = 8) => api.get('/sales/recent/', { params: { limit } }).then((r) => r.data),
};
export const reportService = {
  getDashboard: () => api.get('/reports/dashboard/').then((r) => r.data),
  getSalesReport: (p) => api.get('/reports/sales/', { params: p }).then((r) => r.data),
  getDailySales: (p) => api.get('/reports/daily-sales/', { params: p }).then((r) => r.data),
  getMonthlySales: (p) => api.get('/reports/monthly-sales/', { params: p }).then((r) => r.data),
  getTopProducts: (p) => api.get('/reports/top-products/', { params: p }).then((r) => r.data),
  getPaymentSummary: (p) => api.get('/reports/payment-summary/', { params: p }).then((r) => r.data),
};
export const authService = {
  login: (username, password) => api.post('/accounts/login/', { username, password }).then((r) => r.data),
  register: (d) => api.post('/accounts/register/', d).then((r) => r.data),
  logout: (refresh) => api.post('/accounts/logout/', { refresh }),
  getProfile: () => api.get('/accounts/profile/').then((r) => r.data),
  updateProfile: (d) => api.patch('/accounts/profile/', d).then((r) => r.data),
  changePassword: (d) => api.post('/accounts/change-password/', d).then((r) => r.data),
};
