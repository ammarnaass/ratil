/**
 * رتل - Ratil
 * المصدر الموحد لمحددات الخطوط ومقاييس القراءة (Typography Tokens)
 * features/theme/tokens/typography.tokens.ts
 */

import type { QuranFontSizeLevel, QuranFontScaleConfig } from '../types/typography.types';

export const FONT_FAMILIES = {
  quranHafs: "'KFGQPC Uthmanic Hafs', 'Amiri', serif",
  quranWarsh: "'KFGQPC Uthmanic Warsh', 'Amiri', serif",
  ui: "'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
} as const;

/**
 * مستويات تحجيم خط النص القرآني المتجاوبة مع الجوال والكمبيوتر
 */
export const QURAN_FONT_SCALES: Record<QuranFontSizeLevel, QuranFontScaleConfig> = {
  sm: {
    label: 'صغير',
    mobileSize: '20px',
    desktopSize: '22px',
    lineHeight: '2.1',
  },
  md: {
    label: 'متوسط (قياسي)',
    mobileSize: '22px',
    desktopSize: '26px',
    lineHeight: '2.3',
  },
  lg: {
    label: 'كبير',
    mobileSize: '26px',
    desktopSize: '32px',
    lineHeight: '2.4',
  },
  xl: {
    label: 'كبير جداً',
    mobileSize: '30px',
    desktopSize: '38px',
    lineHeight: '2.6',
  },
} as const;

export const DEFAULT_QURAN_FONT_SIZE_LEVEL: QuranFontSizeLevel = 'md';
export const QURAN_FONT_SIZE_STORAGE_KEY = 'ratil_quran_font_size';
