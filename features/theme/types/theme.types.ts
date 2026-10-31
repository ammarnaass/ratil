/**
 * رتل - Ratil
 * نقطة التصدير المركزية لأنواع المظهر ونظام التصميم (Theme Types Entry)
 * features/theme/types/theme.types.ts
 */

export type ThemeMode = 'dark' | 'light' | 'system';

export interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export interface ColorToken {
  name: string;
  variable: string;
  darkHex: string;
  lightHex: string;
  description: string;
  contrastRatio?: string;
}

export interface QuranTypographyToken {
  fontFamily: string;
  fontSizeMobile: string;
  fontSizeDesktop: string;
  lineHeight: string;
}

// تصدير الأنواع الفرعية التخصصية
export * from './colors.types';
export * from './typography.types';
