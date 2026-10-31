import React from 'react';
import type { HomePageViewProps } from '../types/home.types';
import { SearchBox } from '@/features/quran';
import Player from '@/features/player';
import HomeHero from './HomeHero';
import RecitersSection from './RecitersSection';
import SurahsCatalogSection from './SurahsCatalogSection';

/**
 * رتل - Ratil
 * العرض المعياري الشامل للصفحة الرئيسية
 * features/home/components/HomePageView.tsx
 */
export function HomePageView({ reciters, surahs }: HomePageViewProps) {
  return (
    <div className="w-full flex flex-col gap-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {/* 1. قسم البطل: استئناف الاستماع السريع وميثاق التوثيق */}
      <HomeHero />

      {/* 2. قسم البحث السريع في السور */}
      <section className="w-full">
        <SearchBox initialSurahs={surahs as any} />
      </section>

      {/* 3. قسم القرّاء المعتمدين وتراخيصهم */}
      <RecitersSection reciters={reciters} />

      {/* 4. فهرس سور القرآن الكريم (١١٤ سورة) */}
      <SurahsCatalogSection surahs={surahs} />

      {/* 5. مشغل صوتي مبدئي للموقع */}
      <Player surahId={18} surahName="الكهف" reciters={reciters} />
    </div>
  );
}

export default HomePageView;
