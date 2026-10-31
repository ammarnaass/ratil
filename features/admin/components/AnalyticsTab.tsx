'use client';

/**
 * رتل - Ratil
 * تبويب إحصائيات التنزيل والاستماع المباشر (Analytics Tab)
 * features/admin/components/AnalyticsTab.tsx
 */

import React from 'react';
import { Activity, Download, RefreshCw, Loader2 } from 'lucide-react';
import type { AnalyticsOverview } from '../types/admin.types';
import { AnalyticsKpiCards } from './AnalyticsKpiCards';
import { ListenTrendsChart } from './ListenTrendsChart';
import { TopSurahsTable } from './TopSurahsTable';

export interface AnalyticsTabProps {
  analytics: AnalyticsOverview | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export function AnalyticsTab({
  analytics,
  isLoading,
  onRefresh,
}: AnalyticsTabProps) {
  const handleExportCSV = () => {
    if (!analytics) return;
    const headers = ['السورة', 'عدد الاستماعات', 'عدد التنزيلات'];
    const rows = analytics.topSurahs.map((s) => [
      `"${s.surahName}"`,
      s.plays,
      s.downloads,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ratil-analytics-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-on-surface-variant gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs">جاري تحميل إحصائيات التنزيل والاستماع...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* الترويسة وأزرار الإجراءات */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-on-surface">إحصائيات التنزيل والاستماع</h2>
            <p className="text-[11px] text-on-surface-variant">
              رصد حي للنشاط والتلاوات مع الحفاظ التام على خصوصية المستخدمين
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-all border border-surface-container-highest"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs text-on-surface font-semibold transition-all border border-surface-container-highest shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>تصدير الإحصائيات (CSV)</span>
          </button>
        </div>
      </div>

      {/* 1. بطاقات المؤشرات الأربعة */}
      <AnalyticsKpiCards analytics={analytics} />

      {/* 2. الرسم البياني للمنحنى الزمني */}
      <ListenTrendsChart trends={analytics.trends} />

      {/* 3. جداول السور والقرّاء الأكثر طلباً */}
      <TopSurahsTable
        topSurahs={analytics.topSurahs}
        topReciters={analytics.topReciters}
      />
    </div>
  );
}

export default AnalyticsTab;
