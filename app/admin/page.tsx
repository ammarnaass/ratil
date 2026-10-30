'use client';

/**
 * رتل - Ratil
 * صفحة لوحة الإدارة والحوكمة المركزية (Next.js 14 App Router)
 * معمارية معيارية نظيفة تعتمد على components/admin
 * app/admin/page.tsx
 */

import React from 'react';
import {
  useAdminDashboard,
  AdminLogin,
  AdminSidebar,
  AdminHeader,
  RecitersTab,
  AudioTab,
  ReportsTab,
  HealthTab,
} from '@/components/admin';

export default function AdminPage() {
  const admin = useAdminDashboard();

  if (!admin.isAuthenticated) {
    return (
      <AdminLogin
        adminSecret={admin.adminSecret}
        setAdminSecret={admin.setAdminSecret}
        authError={admin.authError}
        isLoading={admin.isLoading}
        onLogin={admin.handleLogin}
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

      <main className="flex-1 flex flex-col gap-6 bg-surface-container-lowest/50 border border-surface-container-high rounded-2xl p-6 shadow-sm">
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
