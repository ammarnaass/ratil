'use client';

/**
 * رتل - Ratil
 * بطاقات مؤشرات الأداء الرئيسية للإحصائيات (KPI Cards)
 * features/admin/components/AnalyticsKpiCards.tsx
 */

import React from 'react';
import { Headphones, Download, Database, CheckCircle, TrendingUp } from 'lucide-react';
import type { AnalyticsOverview } from '../types/admin.types';

export interface AnalyticsKpiCardsProps {
  analytics: AnalyticsOverview;
}

export function AnalyticsKpiCards({ analytics }: AnalyticsKpiCardsProps) {
  const bandwidthGb = (analytics.bandwidthMb / 1024).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. إجمالي الاستماعات */}
      <div className="p-5 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col justify-between gap-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-on-surface-variant">إجمالي الاستماعات</span>
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Headphones className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-on-surface">
            {analytics.totalPlays.toLocaleString('ar-EG')}
          </span>
          <span className="text-[10px] text-primary font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>+{analytics.todayPlays} اليوم</span>
          </span>
        </div>
        <span className="text-[10px] text-outline">تلاوات مستمعة عبر المشغل المباشر</span>
      </div>

      {/* 2. إجمالي التنزيلات */}
      <div className="p-5 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col justify-between gap-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-on-surface-variant">إجمالي التنزيلات (MP3)</span>
          <div className="w-8 h-8 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
            <Download className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-on-surface">
            {analytics.totalDownloads.toLocaleString('ar-EG')}
          </span>
          <span className="text-[10px] text-secondary font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>+{analytics.todayDownloads} اليوم</span>
          </span>
        </div>
        <span className="text-[10px] text-outline">ملفات صوتية محملة للأجهزة محلياً</span>
      </div>

      {/* 3. استهلاك الباندويث */}
      <div className="p-5 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col justify-between gap-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-on-surface-variant">حجم البيانات المنقولة</span>
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-on-surface">
            {bandwidthGb}
          </span>
          <span className="text-xs font-bold text-on-surface-variant">جيجابايت</span>
        </div>
        <span className="text-[10px] text-outline">خدمات تدفق وسائط سريعة عبر Archive.org</span>
      </div>

      {/* 4. معدل إكمال الاستماع */}
      <div className="p-5 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col justify-between gap-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-on-surface-variant">معدل الاستماع المكتمل</span>
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-on-surface">
            %{analytics.completionRate}
          </span>
          <span className="text-[10px] text-primary font-bold">ممتاز</span>
        </div>
        <span className="text-[10px] text-outline">استماع حتى نهاية السورة الكريمة</span>
      </div>
    </div>
  );
}

export default AnalyticsKpiCards;
