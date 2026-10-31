import React from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import type { SurahCardProps } from '../types/quran.types';
import { toArabicDigits } from '@/lib/normalize';

/**
 * رتل - Ratil
 * بطاقة السورة القرآنية في الفهرس العام
 * features/quran/components/SurahCard.tsx
 */
export function SurahCard({ surah }: SurahCardProps) {
  const sName = surah.ar || surah.name_ar;
  const sEn = surah.en || surah.name_en;
  const ayahsCount = surah.ayahs || surah.ayahs_hafs || 0;
  const isMeccan = surah.type === 'مكية';

  return (
    <Link
      href={`/surah/${surah.id}`}
      className="group relative flex items-center justify-between p-4 rounded-2xl bg-surface-container/60 hover:bg-surface-container-high/80 hover:border-primary/40 border border-surface-container-high transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* رقم السورة مع إطار زخرفي */}
        <div className="relative w-11 h-11 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-surface-container-highest group-hover:border-primary/50 group-hover:bg-primary group-hover:text-on-primary transition-all duration-200 shadow-inner">
          <span className="tabular-nums group-hover:scale-110 transition-transform">
            {toArabicDigits(surah.id)}
          </span>
        </div>

        {/* تفاصيل السورة */}
        <div className="flex flex-col min-w-0">
          <span className="text-base font-bold text-on-surface group-hover:text-primary transition-colors truncate">
            سورة {sName}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-0.5">
            <span className="font-mono text-[11px] text-outline group-hover:text-on-surface-variant transition-colors">
              {sEn}
            </span>
            <span className="inline-block w-1 h-1 rounded-full bg-outline" />
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
                isMeccan
                  ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400'
                  : 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400'
              }`}
            >
              {surah.type}
            </span>
          </div>
        </div>
      </div>

      {/* عدد الآيات وأيقونة الاستماع السريع عند التحويم */}
      <div className="flex items-center gap-3 shrink-0 pl-1">
        <div className="flex flex-col items-end">
          <span className="text-xs font-semibold text-primary tabular-nums">
            {toArabicDigits(ayahsCount)} آية
          </span>
          <span className="text-[11px] text-on-surface-variant/70 mt-0.5">
            ص {toArabicDigits(surah.page || 1)}
          </span>
        </div>

        {/* زر تشغيل يظهر بسلاسة عند مرور المؤشر */}
        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-primary group-hover:text-on-primary transition-all duration-200 shadow-sm shrink-0">
          <Play className="w-3.5 h-3.5 fill-current" />
        </div>
      </div>
    </Link>
  );
}

export default SurahCard;

