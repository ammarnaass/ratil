'use client';

/**
 * رتل - Ratil
 * الشريط الجانبي للوحة الإدارة
 * features/admin/components/AdminSidebar.tsx
 */

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Radio,
  AlertCircle,
  Activity,
  Database,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { Logo } from '@/features/navigation';
import type { TabType } from '../types/admin.types';

export interface AdminSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  recitersCount: number;
  newReportsCount: number;
  onLogout: () => void;
}

export function AdminSidebar({
  activeTab,
  setActiveTab,
  recitersCount,
  newReportsCount,
  onLogout,
}: AdminSidebarProps) {
  return (
    <aside className="w-full lg:w-64 bg-surface-container-low border border-surface-container-high rounded-2xl p-4 flex flex-col justify-between gap-6 shrink-0 shadow-sm">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between pb-4 border-b border-surface-container-high">
          <div className="flex items-center gap-2.5">
            <Logo size={32} />
            <div className="flex flex-col">
              <span className="font-bold text-sm text-on-surface">إدارة رتّل المركزية</span>
              <span className="text-[10px] text-primary font-mono font-medium">
                Vercel • Neon • Archive.org
              </span>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider px-2 mb-1">
            أقسام الإدارة والحوكمة
          </span>

          <button
            onClick={() => setActiveTab('reciters')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'reciters'
                ? 'bg-primary text-on-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 shrink-0" />
              <span>إدارة القرّاء</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                activeTab === 'reciters'
                  ? 'bg-on-primary/20 text-on-primary'
                  : 'bg-surface-container-highest text-primary'
              }`}
            >
              {recitersCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'audio'
                ? 'bg-primary text-on-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4 shrink-0" />
              <span>الصوتيات وArchive</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'users'
                ? 'bg-primary text-on-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 shrink-0" />
              <span>المستخدمين والأدوار</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-primary text-on-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 shrink-0" />
              <span>إحصائيات التنزيل والاستماع</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'audit'
                ? 'bg-primary text-on-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span>سجل التدقيق الإداري</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'reports'
                ? 'bg-primary text-on-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>بلاغات التدقيق</span>
            </div>
            {newReportsCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                  activeTab === 'reports'
                    ? 'bg-on-primary/20 text-on-primary'
                    : 'bg-error-container text-on-error-container'
                }`}
              >
                {newReportsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'health'
                ? 'bg-primary text-on-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 shrink-0" />
              <span>فحص Archive.org</span>
            </div>
          </button>
        </nav>
      </div>

      <div className="flex flex-col gap-3 pt-4 border-t border-surface-container-high text-xs">
        <div className="p-2.5 rounded-xl bg-surface-container border border-surface-container-high/60 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <Database className="w-3.5 h-3.5 text-primary" />
            <span>Neon PostgreSQL</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] text-primary font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            متصل
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            className="flex-1 py-2 px-3 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors text-center text-xs flex items-center justify-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>المصحف</span>
          </Link>

          <button
            onClick={onLogout}
            title="تسجيل الخروج"
            className="py-2 px-3 rounded-xl bg-surface-container-high text-error hover:bg-error/10 transition-colors text-xs flex items-center justify-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>قفل</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
