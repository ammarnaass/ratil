'use client';

/**
 * رتل - Ratil
 * ترويسة لوحة الإدارة وشريط الإشعارات
 * features/admin/components/AdminHeader.tsx
 */

import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { TabType, StatusMessage } from '../types/admin.types';

interface AdminHeaderProps {
  activeTab: TabType;
  statusMessage: StatusMessage | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export function AdminHeader({
  activeTab,
  statusMessage,
  isLoading,
  onRefresh,
}: AdminHeaderProps) {
  const getTabTitle = (tab: TabType) => {
    switch (tab) {
      case 'reciters':
        return 'إدارة المشايخ والقرّاء والرخص';
      case 'audio':
        return 'قواعد التخزين الصوتي وتدفق السور (Archive.org)';
      case 'users':
        return 'مراقبة وإدارة المستخدمين والحسابات';
      case 'analytics':
        return 'إحصائيات التنزيل والاستماع المباشر';
      case 'audit':
        return 'سجل التدقيق والحوكمة والعمليات الإدارية';
      case 'reports':
        return 'مركز مراجعة وتدقيق بلاغات الأخطاء العلمية';
      case 'health':
        return 'فحص جودة استجابة مصادر Archive.org الحية';
    }
  };

  return (
    <div className="flex items-center justify-between pb-4 border-b border-surface-container-high flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-on-surface">
          {getTabTitle(activeTab)}
        </h1>
        {statusMessage && (
          <span
            className={`text-xs px-2.5 py-1 rounded-lg ${
              statusMessage.isError
                ? 'bg-error-container text-on-error-container'
                : 'bg-primary/10 text-primary'
            }`}
          >
            {statusMessage.text}
          </span>
        )}
      </div>

      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs transition-colors border border-surface-container-high disabled:opacity-50"
        title="تحديث البيانات"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        <span>تحديث</span>
      </button>
    </div>
  );
}

export default AdminHeader;
