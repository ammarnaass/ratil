import React from 'react';
import type { SurahHeaderProps } from '../types/quran.types';
import { BISMILLAH_TEXT } from '../constants/quran.constants';
import { toArabicDigits } from '@/lib/normalize';

/**
 * رتل - Ratil
 * ترويسة السورة الكريمة وبسملة التلاوة
 * features/quran/components/SurahHeader.tsx
 */
export function SurahHeader({ surah, riwaya = 'hafs' }: SurahHeaderProps) {
  const showBismillah = surah.id !== 1 && surah.id !== 9;
  const fontClass = riwaya === 'warsh' ? 'font-quran-warsh' : 'font-quran-hafs';
  const ayahsCount = surah.ayahs || surah.ayahs_hafs || 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-surface-container border border-surface-container-high p-6 md:p-8 text-center flex flex-col items-center shadow-lg">
      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
        <span>سورة رقم {surah.id}</span>
        <span>•</span>
        <span>{surah.type}</span>
        <span>•</span>
        <span>{toArabicDigits(ayahsCount)} آية</span>
      </div>

      <h1 className="text-3xl md:text-5xl font-bold text-on-surface mb-2 font-quran-hafs">
        سورة {surah.ar || surah.name_ar}
      </h1>
      <p className="text-sm text-on-surface-variant max-w-md">
        {surah.en || surah.name_en} • مصحف معتمد برواية {riwaya === 'warsh' ? 'ورش عن نافع' : 'حفص عن عاصم'}
      </p>

      {showBismillah && (
        <div className="mt-6 pt-6 border-t border-surface-container-high w-full max-w-md">
          <p className={`text-2xl md:text-3xl text-primary/90 ${fontClass}`}>
            {BISMILLAH_TEXT}
          </p>
        </div>
      )}
    </div>
  );
}

export default SurahHeader;
