'use client';

/**
 * رتل - Ratil
 * صفحة لوحة الإدارة والحوكمة المركزية (Next.js 14 App Router)
 * معمارية معيارية موجهة بالميزات (Feature-Driven Architecture)
 * app/admin/page.tsx
 */

import React from 'react';
import {
  useAdminDashboard,
  useAdminUsers,
  useAdminAnalytics,
  useAdminAudit,
  AdminLogin,
  AdminSidebar,
  AdminHeader,
  RecitersTab,
  AudioTab,
  UsersTab,
  AnalyticsTab,
  AuditLogsTab,
  ReportsTab,
  HealthTab,
} from '@/features/admin';

export default function AdminPage() {
  const admin = useAdminDashboard();
  const usersHook = useAdminUsers(admin.adminSecret, admin.isAuthenticated);
  const analyticsHook = useAdminAnalytics(admin.adminSecret, admin.isAuthenticated);
  const auditHook = useAdminAudit(admin.adminSecret, admin.isAuthenticated);

  if (!admin.isAuthenticated) {
    return (
      <AdminLogin
        adminSecret={admin.adminSecret}
        setAdminSecret={admin.setAdminSecret}
        authError={admin.authError}
        isLoading={admin.isLoading}
        onLogin={admin.handleLogin}
        isUserAdmin={admin.isUserAdmin}
        currentUser={admin.currentUser}
        onAdminDirectEnter={() => admin.loadData(admin.adminSecret)}
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)]">
      <AdminSidebar
        activeTab={admin.activeTab}
        setActiveTab={admin.setActiveTab}
        recitersCount={admin.reciters.length}
        newReportsCount={admin.newReportsCount}
        onLogout={admin.handleLogout}
      />

      <main className="flex-1 min-w-0 flex flex-col gap-5 sm:gap-6 bg-surface-container-lowest/50 border border-surface-container-high rounded-3xl p-4 sm:p-6 shadow-sm">
        <AdminHeader
          activeTab={admin.activeTab}
          statusMessage={admin.statusMessage}
          isLoading={admin.isLoading}
          onRefresh={() => admin.loadData(admin.adminSecret)}
        />

        {admin.activeTab === 'reciters' && (
          <RecitersTab
            reciters={admin.reciters}
            showAdd={admin.showAddReciter}
            setShowAdd={admin.setShowAddReciter}
            form={admin.reciterForm}
            setForm={admin.setReciterForm}
            onCreate={admin.handleCreateReciter}
            onUpdate={admin.handleUpdateReciter}
            onToggleVisibility={admin.handleToggleVisibility}
            onDelete={admin.handleDeleteReciter}
          />
        )}

        {admin.activeTab === 'audio' && (
          <AudioTab
            reciters={admin.reciters}
            selectedReciterId={admin.selectedReciterId}
            setSelectedReciterId={admin.setSelectedReciterId}
            showAdd={admin.showAddAudio}
            setShowAdd={admin.setShowAddAudio}
            form={admin.audioForm}
            setForm={admin.setAudioForm}
            onSave={admin.handleSaveAudio}
            onSeedSurahs={admin.handleSeedSurahs}
            onUpdateReciter={admin.handleUpdateReciter}
          />
        )}

        {admin.activeTab === 'users' && (
          <UsersTab
            users={usersHook.users}
            isLoading={usersHook.isLoading}
            onUpdateUser={usersHook.handleUpdateUser}
            onDeleteUser={usersHook.handleDeleteUser}
          />
        )}

        {admin.activeTab === 'analytics' && (
          <AnalyticsTab
            analytics={analyticsHook.analytics}
            isLoading={analyticsHook.isLoading}
            onRefresh={analyticsHook.loadAnalytics}
          />
        )}

        {admin.activeTab === 'audit' && (
          <AuditLogsTab
            logs={auditHook.logs}
            isLoading={auditHook.isLoading}
            onRefresh={auditHook.loadAuditLogs}
          />
        )}

        {admin.activeTab === 'reports' && (
          <ReportsTab
            reports={admin.reports}
            filteredReports={admin.filteredReports}
            filter={admin.reportFilter}
            setFilter={admin.setReportFilter}
            onUpdate={admin.handleUpdateReport}
            onDelete={admin.handleDeleteReport}
          />
        )}

        {admin.activeTab === 'health' && (
          <HealthTab
            data={admin.healthData}
            isLoading={admin.isLoading}
            onRunHealthCheck={admin.handleRunHealthCheck}
          />
        )}
      </main>
    </div>
  );
}
