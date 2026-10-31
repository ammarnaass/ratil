/**
 * رتل - Ratil
 * ثوابت ميزة تصفح وعرض القرآن الكريم
 * features/quran/constants/quran.constants.ts
 */

export const QUICK_SURAH_PICKS = [
  { id: 18, name: 'الكهف' },
  { id: 36, name: 'يس' },
  { id: 55, name: 'الرحمن' },
  { id: 56, name: 'الواقعة' },
  { id: 67, name: 'الملك' },
] as const;

export const BISMILLAH_TEXT = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

export const SURAH_REVELATION_TYPES = ['all', 'مكية', 'مدنية'] as const;
export type SurahRevelationFilter = typeof SURAH_REVELATION_TYPES[number];
