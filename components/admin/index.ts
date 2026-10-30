/**
 * رتل - Ratil
 * نقطة الدخول العامة لمكونات لوحة الإدارة
 * components/admin/index.ts
 */

export type * from './types';
export * from './constants';
export { useAdminDashboard } from './useAdminDashboard';
export { default as AdminLogin } from './AdminLogin';
export { default as AdminSidebar } from './AdminSidebar';
export { default as AdminHeader } from './AdminHeader';
export { default as RecitersTab } from './RecitersTab';
export { default as AudioTab } from './AudioTab';
export { default as ReportsTab } from './ReportsTab';
export { default as HealthTab } from './HealthTab';
