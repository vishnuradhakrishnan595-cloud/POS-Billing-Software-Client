
import { api } from "./api.js";
import { unwrap } from "../utils/format.js";

// =========================================================
// GENERIC CRUD
// =========================================================

const crud = (path) => ({
  list: (params) =>
    api
      .get(`${path}/`, { params })
      .then((response) => response.data),

  get: (id) =>
    api
      .get(`${path}/${id}/`)
      .then(unwrap),

  create: (data) =>
    api
      .post(`${path}/`, data)
      .then(unwrap),

  update: (id, data) =>
    api
      .patch(`${path}/${id}/`, data)
      .then(unwrap),

  remove: (id) =>
    api.delete(`${path}/${id}/`),
});

// =========================================================
// PRODUCT
// =========================================================

export const productService = crud(
  "/inventory/products"
);

// =========================================================
// CATEGORY
// =========================================================

export const categoryService = crud(
  "/inventory/categories"
);

// =========================================================
// BRAND
// =========================================================

export const brandService = crud(
  "/inventory/brands"
);

// =========================================================
// USERS
// =========================================================

export const userService = crud(
  "/accounts/users"
);

// =========================================================
// CUSTOMERS
// =========================================================

export const customerService = crud(
  "/sales/customers"
);

// =========================================================
// INVENTORY
// =========================================================

export const inventoryService = {
  adjustStock: (data) =>
    api
      .post("/inventory/stock/adjust/", data)
      .then(unwrap),

  getLowStock: () =>
    api
      .get("/inventory/low-stock/")
      .then((response) => response.data),

  getTransactions: (params) =>
    api
      .get("/inventory/stock/", { params })
      .then((response) => response.data),
};

// =========================================================
// SALES
// =========================================================

export const salesService = {
  getSales: (params) =>
    api
      .get("/sales/", { params })
      .then((response) => response.data),

  getSale: (id) =>
    api
      .get(`/sales/${id}/`)
      .then((response) => response.data),

  createSale: (data) =>
    api
      .post("/sales/", data)
      .then(unwrap),

  getRecentSales: (limit = 8) =>
    api
      .get("/sales/recent/", {
        params: { limit },
      })
      .then((response) => response.data),
};

// =========================================================
// REPORTS
// =========================================================

export const reportService = {
  getDashboard: () =>
    api
      .get("/reports/dashboard/")
      .then((response) => response.data),

  getSalesReport: (params) =>
    api
      .get("/reports/sales/", { params })
      .then((response) => response.data),

  getDailySales: (params) =>
    api
      .get("/reports/daily-sales/", { params })
      .then((response) => response.data),

  getMonthlySales: (params) =>
    api
      .get("/reports/monthly-sales/", { params })
      .then((response) => response.data),

  getTopProducts: (params) =>
    api
      .get("/reports/top-products/", { params })
      .then((response) => response.data),

  getPaymentSummary: (params) =>
    api
      .get("/reports/payment-summary/", { params })
      .then((response) => response.data),
};

// =========================================================
// AUTHENTICATION
// =========================================================

export const authService = {
  login: (username, password) =>
    api
      .post("/accounts/login/", {
        username,
        password,
      })
      .then((response) => response.data),

  register: (data) =>
    api
      .post("/accounts/register/", data)
      .then((response) => response.data),

  logout: (refresh) =>
    api.post("/accounts/logout/", {
      refresh,
    }),

  getProfile: () =>
    api
      .get("/accounts/profile/")
      .then((response) => response.data),

  updateProfile: (data) =>
    api
      .patch("/accounts/profile/", data)
      .then((response) => response.data),

  changePassword: (data) =>
    api
      .post("/accounts/change-password/", data)
      .then((response) => response.data),
};
