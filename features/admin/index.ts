'use client';

/**
 * رتل - Ratil
 * نقطة التصدير المركزية لميزة لوحة الإدارة والحوكمة
 * features/admin/index.ts
 */

// الأنواع (Types)
export * from './types/admin.types';

// الثوابت (Constants)
export * from './constants/admin.constants';

// الخدمات (Services)
export * from './services/admin.service';

// الخطافات المخصصة (Hooks)
export * from './hooks/useAdminDashboard';
export * from './hooks/useAdminUsers';
export * from './hooks/useAdminAnalytics';
export * from './hooks/useAdminAudit';

// المكونات البصرية (Components)
export * from './components/AdminHeader';
export * from './components/AdminLogin';
export * from './components/AdminSidebar';
export * from './components/AudioTab';
export * from './components/AudioToolbar';
export * from './components/ArchiveRulesCard';
export * from './components/SurahCardItem';
export * from './components/SurahQuickEditModal';
export * from './components/BulkSeedModal';
export * from './components/CreateReciterForm';
export * from './components/EditReciterModal';
export * from './components/HealthTab';
export * from './components/RecitersTab';
export * from './components/ReportsTab';
export * from './components/UsersTab';
export * from './components/UserCardItem';
export * from './components/EditUserRoleModal';
export * from './components/AnalyticsTab';
export * from './components/AnalyticsKpiCards';
export * from './components/ListenTrendsChart';
export * from './components/TopSurahsTable';
export * from './components/AuditLogsTab';
