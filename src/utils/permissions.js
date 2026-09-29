const r = (u) => u?.role;
export const isAdmin = (u) => r(u) === 'ADMIN';
export const isManager = (u) => r(u) === 'MANAGER';
export const isCashier = (u) => r(u) === 'CASHIER';
export const isStaff = (u) => r(u) === 'STAFF';
export const canManageProducts = (u) => isAdmin(u) || isManager(u);
export const canManageUsers = (u) => isAdmin(u);
export const canViewReports = (u) => isAdmin(u) || isManager(u);
export const canCreateSales = (u) => isAdmin(u) || isManager(u) || isCashier(u);
