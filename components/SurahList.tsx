/**
 * رتل - Ratil
 * قائمة السور الـ 114 (Server Component)
 * components/SurahList.tsx
 */

import Link from 'next/link';
import { Play, BookOpen } from 'lucide-react';
import type { Surah } from '@/lib/types';
import { toArabicDigits } from '@/lib/normalize';

interface SurahListProps {
  surahs: Surah[];
}

export default function SurahList({ surahs }: SurahListProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {surahs.map((surah) => {
          const sName = surah.ar || surah.name_ar;
          const sEn = surah.en || surah.name_en;
          const ayahsCount = surah.ayahs || surah.ayahs_hafs || 0;

          return (
            <Link
              key={surah.id}
              href={`/surah/${surah.id}`}
              className="group relative flex items-center justify-between p-4 rounded-2xl bg-surface-container/70 hover:bg-surface-container hover:border-primary/40 border border-surface-container-high transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* رقم السورة */}
                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary font-bold text-sm shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  {surah.id}
                </div>

                {/* تفاصيل السورة */}
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                    سورة {sName}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-0.5">
                    <span>{sEn}</span>
                    <span className="inline-block w-1 h-1 rounded-full bg-outline"></span>
                    <span>{surah.type}</span>
                  </div>
                </div>
              </div>

              {/* عدد الآيات وزر الاستماع */}
              <div className="flex flex-col items-end shrink-0 pl-1">
                <span className="text-xs font-semibold text-primary tabular-nums">
                  {toArabicDigits(ayahsCount)} آية
                </span>
                <span className="text-[11px] text-on-surface-variant/70 mt-0.5">
                  ص {toArabicDigits(surah.page || 1)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
