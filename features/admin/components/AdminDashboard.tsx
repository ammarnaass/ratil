/**
 * رتل - Ratil
 * واجهة لوحة تحكم وحوكمة النظام المركزية
 * features/admin/components/AdminDashboard.tsx
 */

import React from 'react';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { AdminLoginCard } from './AdminLoginCard';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { IntegrityScanTab } from './IntegrityScanTab';
import { RecitersManagementTab } from './RecitersManagementTab';
import { AudioManagementTab } from './AudioManagementTab';
import { HealthCheckTab } from './HealthCheckTab';
import { ReportsModerationTab } from './ReportsModerationTab';

export function AdminDashboard() {
  const {
    isAuthenticated,
    activeTab,
    setActiveTab,
    isLoading,
    statusMessage,
    reciters,
    reports,
    healthData,
    integrityData,
    handleLogin,
    handleLogout,
    refreshIntegrity,
    runHealthCheck,
    createReciter,
    toggleReciterVisibility,
    resolveReport,
    reload,
  } = useAdminDashboard();

  if (!isAuthenticated) {
    return <AdminLoginCard onLogin={handleLogin} />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)]">
      {/* 1. الشريط الجانبي */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        recitersCount={reciters.length}
        reportsCount={reports.length}
        onLogout={handleLogout}
      />

      {/* 2. منطقة المحتوى الرئيسي */}
      <main className="flex-1 flex flex-col gap-6 bg-surface-container-lowest/50 border border-surface-container-high rounded-2xl p-6 shadow-sm">
        <AdminHeader
          activeTab={activeTab}
          isLoading={isLoading}
          onRefresh={reload}
          statusMessage={statusMessage}
        />

        {/* عرض التبويب النشط من الشاشات الخمس */}
        <div className="flex-1">
          {activeTab === 'integrity' && (
            <IntegrityScanTab data={integrityData} onRefresh={refreshIntegrity} />
          )}

          {activeTab === 'reciters' && (
            <RecitersManagementTab
              reciters={reciters}
              onCreateReciter={createReciter}
              onToggleVisibility={toggleReciterVisibility}
            />
          )}

          {activeTab === 'audio' && (
            <AudioManagementTab reciters={reciters} />
          )}

          {activeTab === 'health' && (
            <HealthCheckTab
              healthData={healthData}
              isLoading={isLoading}
              onRunHealthCheck={runHealthCheck}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsModerationTab
              reports={reports}
              onResolveReport={resolveReport}
            />
          )}
        </div>
      </main>
    </div>
  );
}
