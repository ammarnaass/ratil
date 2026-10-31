'use client';

/**
 * رتل - Ratil
 * خطاف مخصص لإدارة تفضيلات خط المصحف وتكبير/تصغير الآيات
 * features/theme/hooks/useQuranFont.ts
 */

import { useContext } from 'react';
import { QuranFontContext } from '../context/quran-font.context';
import type { QuranFontContextType } from '../types/typography.types';

export function useQuranFont(): QuranFontContextType {
  const context = useContext(QuranFontContext);

  if (!context) {
    throw new Error('useQuranFont must be used within a QuranFontProvider (inside ThemeProvider)');
  }

  return context;
}
