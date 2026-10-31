'use client';

/**
 * رتل - Ratil
 * جداول السور والقرّاء الأكثر إقبالاً وطلباً
 * features/admin/components/TopSurahsTable.tsx
 */

import React from 'react';
import { BookOpen, User, ArrowUpRight } from 'lucide-react';
import type { AnalyticsOverview } from '../types/admin.types';

export interface TopSurahsTableProps {
  topSurahs: AnalyticsOverview['topSurahs'];
  topReciters: AnalyticsOverview['topReciters'];
}

export function TopSurahsTable({ topSurahs, topReciters }: TopSurahsTableProps) {
  const maxSurahPlays = topSurahs[0]?.plays || 1;
  const maxReciterPlays = topReciters[0]?.plays || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. السور الأكثر استماعاً */}
      <div className="p-6 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col gap-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-on-surface">السور الأكثر استماعاً وطلباً</h3>
          </div>
          <span className="text-[11px] text-outline font-mono">Top 5</span>
        </div>

        <div className="flex flex-col gap-3">
          {topSurahs.map((surah) => {
            const percent = Math.round((surah.plays / maxSurahPlays) * 100);
            return (
              <div key={surah.surahNumber} className="flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-outline">#{surah.surahNumber}</span>
                    <span className="font-bold text-on-surface">{surah.surahName}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-primary font-bold">{surah.plays} استماع</span>
                    <span className="text-on-surface-variant text-[10px]">{surah.downloads} تنزيل</span>
                  </div>
                </div>

                {/* شريط التقدم */}
                <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                  <div
                    style={{ width: `${percent}%` }}
                    className="h-full rounded-full bg-primary transition-all duration-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. القرّاء الأكثر استماعاً */}
      <div className="p-6 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col gap-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-secondary" />
            <h3 className="text-sm font-bold text-on-surface">القرّاء الأكثر إقبالاً</h3>
          </div>
          <span className="text-[11px] text-outline font-mono">المشايخ</span>
        </div>

        <div className="flex flex-col gap-3">
          {topReciters.map((reciter) => {
            const percent = Math.round((reciter.plays / maxReciterPlays) * 100);
            return (
              <div key={reciter.reciterId} className="flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface">{reciter.reciterName}</span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-secondary font-bold">{reciter.plays} استماع</span>
                    <span className="text-on-surface-variant text-[10px]">{reciter.downloads} تنزيل</span>
                  </div>
                </div>

                {/* شريط التقدم */}
                <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                  <div
                    style={{ width: `${percent}%` }}
                    className="h-full rounded-full bg-secondary transition-all duration-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TopSurahsTable;
