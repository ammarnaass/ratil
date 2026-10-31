import React from 'react';
import type { SurahListProps } from '../types/quran.types';
import SurahCard from './SurahCard';

/**
 * رتل - Ratil
 * قائمة واستعراض سور القرآن الكريم الـ 114
 * features/quran/components/SurahList.tsx
 */
export function SurahList({ surahs }: SurahListProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {surahs.map((surah) => (
          <SurahCard key={surah.id} surah={surah} />
        ))}
      </div>
    </div>
  );
}

export default SurahList;
