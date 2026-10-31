/**
 * رتل - Ratil
 * أنواع ومعرّفات ميزة تصفح وعرض وقراءة القرآن الكريم
 * features/quran/types/quran.types.ts
 */

import type { Surah, Reciter } from '@/lib/types';

export interface Verse {
  number: number;
  text: string;
}

export interface SurahTextProps {
  surah: Surah;
  verses?: Verse[];
  activeAyah?: number;
  onAyahClick?: (ayahNumber: number) => void;
  riwaya?: 'hafs' | 'warsh';
}

export interface SurahHeaderProps {
  surah: Surah;
  riwaya?: 'hafs' | 'warsh';
}

export interface AyahItemProps {
  verse: Verse;
  isActive: boolean;
  isBookmarked: boolean;
  onAyahClick?: (ayahNumber: number) => void;
  onToggleBookmark: (ayahNumber: number) => void;
}

export interface SurahCardProps {
  surah: Surah;
}

export interface SurahListProps {
  surahs: Surah[];
}

export interface SearchItem {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  name_normalized?: string;
  latin?: string[];
  type?: string;
  ayahs?: number;
  ayahs_hafs?: number;
  page?: number;
}

export interface SearchBoxProps {
  initialSurahs?: SearchItem[];
  onSelectSurah?: (surahId: number) => void;
}

export interface ReciterCardProps {
  reciter: Reciter;
}
