/**
 * رتل - Ratil
 * الشريط الجانبي للوحة الحوكمة والإدارة
 * features/admin/components/AdminSidebar.tsx
 */

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Users,
  Radio,
  Activity,
  AlertCircle,
  LogOut,
  ExternalLink,
  Database,
} from 'lucide-react';
import type { AdminTab } from '../types/admin.types';
import { ADMIN_TABS } from '../constants/admin.constants';
import Logo from '@/components/Logo';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  recitersCount: number;
  reportsCount: number;
  onLogout: () => void;
}

export function AdminSidebar({
  activeTab,
  onTabChange,
  recitersCount,
  reportsCount,
  onLogout,
}: AdminSidebarProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4 shrink-0" />;
      case 'Users': return <Users className="w-4 h-4 shrink-0" />;
      case 'Radio': return <Radio className="w-4 h-4 shrink-0" />;
      case 'Activity': return <Activity className="w-4 h-4 shrink-0" />;
      case 'AlertCircle': return <AlertCircle className="w-4 h-4 shrink-0" />;
      default: return <ShieldCheck className="w-4 h-4 shrink-0" />;
    }
  };

  return (
    <aside className="w-full lg:w-64 bg-surface-container-low border border-surface-container-high rounded-2xl p-4 flex flex-col justify-between gap-6 shrink-0 shadow-sm">
      <div className="flex flex-col gap-6">
        {/* الشعار وبيانات النظام */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-container-high">
          <div className="flex items-center gap-2.5">
            <Logo size={32} />
            <div className="flex flex-col">
              <span className="font-bold text-sm text-on-surface">إدارة رتّل المركزية</span>
              <span className="text-[10px] text-primary font-mono font-medium">Vercel • Neon • Archive</span>
            </div>
          </div>
        </div>

        {/* قائمة الشاشات الخمس */}
        <nav className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider px-2 mb-1">
            الشاشات المركزية (Screens 11-15)
          </span>

          {ADMIN_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as AdminTab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {getIcon(tab.icon)}
                  <span className="truncate">{tab.label}</span>
                </div>

                <div className="flex items-center gap-1">
                  {tab.id === 'reciters' && recitersCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      isActive ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container-highest text-primary'
                    }`}>
                      {recitersCount}
                    </span>
                  )}
                  {tab.id === 'reports' && reportsCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                      isActive ? 'bg-on-primary/20 text-on-primary' : 'bg-error-container text-on-error-container'
                    }`}>
                      {reportsCount}
                    </span>
                  )}
                  <span className={`text-[10px] opacity-70 font-mono ${isActive ? 'text-on-primary' : 'text-outline'}`}>
                    #{tab.screenNumber}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* الحالة السفلية والخروج */}
      <div className="flex flex-col gap-3 pt-4 border-t border-surface-container-high text-xs">
        <div className="p-2.5 rounded-xl bg-surface-container border border-surface-container-high/60 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <Database className="w-3.5 h-3.5 text-primary" />
            <span>Neon Serverless</span>
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
