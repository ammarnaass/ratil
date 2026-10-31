/**
 * رتل - Ratil
 * أنواع ومعرّفات الصفحة الرئيسية (Home Page Types)
 * features/home/types/home.types.ts
 */

import type { Reciter, Surah } from '@/lib/types';

export interface HomePageViewProps {
  reciters: Reciter[];
  surahs: Surah[];
}

export interface HomeHeroProps {
  quickSurahId?: number;
  quickSurahName?: string;
}

export interface RecitersSectionProps {
  reciters: Reciter[];
}

export interface SurahsCatalogSectionProps {
  surahs: Surah[];
}
