import React from 'react';
import { BookOpen } from 'lucide-react';
import type { SurahsCatalogSectionProps } from '../types/home.types';
import { SurahList } from '@/features/quran';

/**
 * رتل - Ratil
 * قسم فهرس سور القرآن الكريم الـ 114
 * features/home/components/SurahsCatalogSection.tsx
 */
export function SurahsCatalogSection({ surahs }: SurahsCatalogSectionProps) {
  return (
    <section className="w-full flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-surface-container-high/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/25 shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
              فهرس سور القرآن الكريم
            </h2>
            <span className="text-xs text-on-surface-variant">
              نص حفص وورش المعتمد مع التتبع الصوتي اللحظي
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-surface-container-high/80 text-primary border border-surface-container-highest shadow-xs">
          <span>١١٤ سورة</span>
          <span className="w-1 h-1 rounded-full bg-outline/50" />
          <span className="text-amber-500 dark:text-amber-400 font-medium">٨٦ مكية</span>
          <span className="w-1 h-1 rounded-full bg-outline/50" />
          <span className="text-emerald-500 dark:text-emerald-400 font-medium">٢٨ مدنية</span>
        </div>
      </div>

      <SurahList surahs={surahs} />
    </section>
  );
}

export default SurahsCatalogSection;

