/**
 * رتل - Ratil
 * الترويسة العلوية ومؤشرات حالة النظام
 * features/admin/components/AdminHeader.tsx
 */

import React from 'react';
import { RefreshCw, CheckCircle2, Radio, Database, ShieldAlert } from 'lucide-react';
import type { AdminTab } from '../types/admin.types';
import { ADMIN_TABS } from '../constants/admin.constants';

interface AdminHeaderProps {
  activeTab: AdminTab;
  isLoading: boolean;
  onRefresh: () => void;
  statusMessage?: { text: string; type: 'success' | 'error' | 'info' } | null;
}

export function AdminHeader({
  activeTab,
  isLoading,
  onRefresh,
  statusMessage,
}: AdminHeaderProps) {
  const currentTab = ADMIN_TABS.find((t) => t.id === activeTab) || ADMIN_TABS[0];

  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-surface-container-high">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-on-surface">{currentTab.label}</h1>
            <span className="text-xs px-2 py-0.5 rounded-md bg-surface-container-high text-primary font-mono font-bold">
              Screen {currentTab.screenNumber}
            </span>
          </div>
          <span className="text-xs text-on-surface-variant mt-0.5">
            لوحة الإدارة المركزية • معمارية Next.js 14 + Neon + Archive.org
          </span>
        </div>

        {/* المؤشرات السريعة وزر التحديث */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container text-xs border border-surface-container-high">
            <Database className="w-3.5 h-3.5 text-primary" />
            <span className="text-on-surface font-mono">Neon DB</span>
            <span className="w-2 h-2 rounded-full bg-primary" />
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container text-xs border border-surface-container-high">
            <Radio className="w-3.5 h-3.5 text-primary" />
            <span className="text-on-surface font-mono">Archive.org</span>
            <span className="w-2 h-2 rounded-full bg-primary" />
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface hover:text-primary hover:border-primary border border-surface-container-highest text-xs transition-all disabled:opacity-50"
            title="تحديث البيانات حياً من الخوادم"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* شريط الإشعارات الحية */}
      {statusMessage && (
        <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border transition-all ${
          statusMessage.type === 'success'
            ? 'bg-primary/10 text-primary border-primary/25'
            : statusMessage.type === 'error'
            ? 'bg-error-container/20 text-error border-error/30'
            : 'bg-surface-container-high text-on-surface border-surface-container-highest'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
}
