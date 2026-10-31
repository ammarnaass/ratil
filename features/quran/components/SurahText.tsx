'use client';

/**
 * رتل - Ratil
 * مكوّن عرض النص القرآني المتصل المعتمد مع التحكم التفاعلي بحجم الخط
 * features/quran/components/SurahText.tsx
 */

import React from 'react';
import type { SurahTextProps } from '../types/quran.types';
import { useSurahVerses } from '../hooks/useSurahVerses';
import { FontScaleControl, useQuranFont } from '@/features/theme';
import SurahHeader from './SurahHeader';
import AyahItem from './AyahItem';

export function SurahText({
  surah,
  verses: initialVerses,
  activeAyah,
  onAyahClick,
  riwaya = 'hafs',
}: SurahTextProps) {
  const { verses, bookmarkedMap, toggleBookmark } = useSurahVerses(surah, initialVerses);
  const { fontSizeClass } = useQuranFont();
  const fontClass = riwaya === 'warsh' ? 'font-quran-warsh' : 'font-quran-hafs';

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 px-4 sm:px-6">
      {/* ترويسة السورة وبسملة التلاوة */}
      <SurahHeader surah={surah} riwaya={riwaya} />

      {/* شريط أدوات القارئ والتحكم في حجم خط المصحف */}
      <div className="flex items-center justify-between pb-1">
        <FontScaleControl />
      </div>

      {/* لوح النص القرآني المتصل المتقن بحجم متجاوب */}
      <div className="rounded-3xl bg-surface-container/50 border border-surface-container-high p-6 md:p-10 shadow-sm leading-loose">
        <div
          className={`text-right text-on-surface leading-[2.6] md:leading-[2.8] ${fontSizeClass} ${fontClass} transition-all duration-150`}
        >
          {verses.map((verse) => (
            <AyahItem
              key={verse.number}
              verse={verse}
              isActive={activeAyah === verse.number}
              isBookmarked={!!bookmarkedMap[verse.number]}
              onAyahClick={onAyahClick}
              onToggleBookmark={toggleBookmark}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SurahText;
