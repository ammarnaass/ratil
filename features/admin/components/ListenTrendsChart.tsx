'use client';

/**
 * رتل - Ratil
 * رسم بياني لمنحنى الاستماع والتنزيل الأسبوعي
 * features/admin/components/ListenTrendsChart.tsx
 */

import React from 'react';
import { BarChart3 } from 'lucide-react';
import type { AnalyticsOverview } from '../types/admin.types';

export interface ListenTrendsChartProps {
  trends: AnalyticsOverview['trends'];
}

export function ListenTrendsChart({ trends }: ListenTrendsChartProps) {
  if (!trends || trends.length === 0) return null;

  const maxPlays = Math.max(...trends.map((t) => t.plays), 100);

  return (
    <div className="p-6 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col gap-5 shadow-xs">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-on-surface">
            منحنى الاستماع والتنزيل الزمني (الأيام الـ 7 الأخيرة)
          </h3>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-on-surface-variant font-medium">الاستماعات</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-secondary" />
            <span className="text-on-surface-variant font-medium">التنزيلات (MP3)</span>
          </div>
        </div>
      </div>

      {/* مخطط الأعمدة المتجاوبة */}
      <div className="h-52 w-full flex items-end justify-between gap-3 pt-6 pb-2 border-b border-surface-container-high">
        {trends.map((day, idx) => {
          const playsHeight = Math.max(12, Math.round((day.plays / maxPlays) * 160));
          const downloadsHeight = Math.max(6, Math.round((day.downloads / maxPlays) * 160));

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <div className="text-[10px] font-mono font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                {day.plays}
              </div>

              <div className="w-full max-w-[36px] flex items-end justify-center gap-1 h-[160px]">
                {/* عمود الاستماع */}
                <div
                  style={{ height: `${playsHeight}px` }}
                  className="w-1/2 rounded-t-lg bg-primary hover:opacity-90 transition-all shadow-xs"
                  title={`${day.date}: ${day.plays} استماع`}
                />
                {/* عمود التحميل */}
                <div
                  style={{ height: `${downloadsHeight}px` }}
                  className="w-1/2 rounded-t-lg bg-secondary hover:opacity-90 transition-all shadow-xs"
                  title={`${day.date}: ${day.downloads} تنزيل`}
                />
              </div>

              <span className="text-[11px] font-medium text-on-surface-variant truncate w-full text-center">
                {day.date}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ListenTrendsChart;
