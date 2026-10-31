import React from 'react';
import Link from 'next/link';
import { Mic, CheckCircle2, Headphones, Radio } from 'lucide-react';
import type { ReciterCardProps } from '../types/quran.types';
import { toArabicDigits } from '@/lib/normalize';

/**
 * رتل - Ratil
 * بطاقة القارئ المعتمد والمصدر والترخيص
 * features/quran/components/ReciterCard.tsx
 */
export function ReciterCard({ reciter }: ReciterCardProps) {
  const surahsCount = reciter.surah_count || (reciter.surahs ? reciter.surahs.length : 114);

  const riwayaLabel =
    reciter.riwaya === 'warsh'
      ? 'ورش عن نافع'
      : reciter.riwaya === 'qalon'
      ? 'قالون عن نافع'
      : 'حفص عن عاصم';

  const licenseLabel =
    reciter.license === 'public-domain'
      ? 'ملك عام (Public Domain)'
      : 'رخصة موثقة ومعتمدة';

  return (
    <div className="flex flex-col justify-between p-6 rounded-3xl bg-surface-container/60 hover:bg-surface-container-high/80 border border-surface-container-high hover:border-primary/40 transition-all duration-300 group shadow-sm hover:shadow-xl hover:-translate-y-1 relative overflow-hidden backdrop-blur-sm">
      {/* وميض خلفي خفيف عند التحويم */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all pointer-events-none" />

      <div className="flex flex-col gap-4 relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-surface-container-high to-surface-container-highest flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-on-primary transition-all duration-200 shadow-inner border border-surface-container-highest group-hover:border-primary/50">
              <Mic className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-base sm:text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                {reciter.name}
              </h3>
              <span className="text-xs text-primary font-semibold mt-0.5 flex items-center gap-1">
                <span>رواية {riwayaLabel}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0 font-semibold shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>موثق</span>
          </div>
        </div>

        {/* معلومات المصدر والترخيص والسور المتاحة */}
        <div className="flex flex-col gap-2 pt-3 border-t border-surface-container-high/80 text-xs text-on-surface-variant">
          <div className="flex items-center justify-between">
            <span className="text-outline">المصدر المعتمد:</span>
            <span className="text-on-surface font-medium truncate max-w-[190px]">
              {reciter.source_name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-outline">الترخيص:</span>
            <span className="text-on-surface-variant font-medium">{licenseLabel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-outline">السور المتوفرة:</span>
            <span className="text-primary font-bold tabular-nums">
              {toArabicDigits(surahsCount)} سورة (كاملاً)
            </span>
          </div>
        </div>
      </div>

      <div className="pt-5 mt-2 relative">
        <Link
          href={`/reciter/${reciter.id}`}
          className="flex items-center justify-center gap-2.5 w-full py-3 rounded-2xl bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-semibold text-xs sm:text-sm transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.01]"
        >
          <Headphones className="w-4 h-4" />
          <span>تصفح واستمع لتلاوات القارئ</span>
        </Link>
      </div>
    </div>
  );
}

export default ReciterCard;
