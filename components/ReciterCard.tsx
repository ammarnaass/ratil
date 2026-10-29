/**
 * رتل - Ratil
 * بطاقة القارئ المعتمد (ReciterCard)
 * components/ReciterCard.tsx
 */

import Link from 'next/link';
import { User, ShieldCheck, CheckCircle2, Mic } from 'lucide-react';
import type { Reciter } from '@/lib/types';
import { toArabicDigits } from '@/lib/normalize';

interface ReciterCardProps {
  reciter: Reciter;
}

export default function ReciterCard({ reciter }: ReciterCardProps) {
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
    <div className="flex flex-col justify-between p-5 rounded-2xl bg-surface-container/70 border border-surface-container-high hover:border-primary/40 hover:bg-surface-container transition-all group shadow-sm hover:shadow-md">
      <div className="flex flex-col gap-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-on-primary transition-all shadow-inner">
              <Mic className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                {reciter.name}
              </h3>
              <span className="text-xs text-primary font-medium mt-0.5">
                رواية {riwayaLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>موثق</span>
          </div>
        </div>

        {/* معلومات المصدر والترخيص */}
        <div className="flex flex-col gap-1.5 pt-3 border-t border-surface-container-high text-xs text-on-surface-variant">
          <div className="flex items-center justify-between">
            <span className="text-outline">المصدر:</span>
            <span className="text-on-surface font-medium truncate max-w-[180px]">
              {reciter.source_name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-outline">الترخيص:</span>
            <span>{licenseLabel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-outline">السور المتوفرة:</span>
            <span className="text-primary font-bold tabular-nums">
              {toArabicDigits(surahsCount)} سورة
            </span>
          </div>
        </div>
      </div>

      <div className="pt-4 mt-2">
        <Link
          href={`/reciter/${reciter.id}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-medium text-xs transition-all shadow-sm"
        >
          <span>تصفح تلاوات القارئ</span>
        </Link>
      </div>
    </div>
  );
}
