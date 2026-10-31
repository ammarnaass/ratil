/**
 * رتل - Ratil
 * تعريفات أنواع الخطوط والمقاييس والطباعة (Typography Token Types)
 * features/theme/types/typography.types.ts
 */

export type QuranFontSizeLevel = 'sm' | 'md' | 'lg' | 'xl';

export type QuranFontRiwaya = 'hafs' | 'warsh' | 'qalon';

export interface QuranFontScaleConfig {
  label: string;
  mobileSize: string;
  desktopSize: string;
  lineHeight: string;
}

export interface QuranFontPreferences {
  sizeLevel: QuranFontSizeLevel;
  riwaya: QuranFontRiwaya;
}

export interface QuranFontContextType {
  preferences: QuranFontPreferences;
  sizeLevel: QuranFontSizeLevel;
  fontSizeClass: string;
  mobilePx: string;
  desktopPx: string;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  setSizeLevel: (level: QuranFontSizeLevel) => void;
  setRiwaya: (riwaya: QuranFontRiwaya) => void;
}

export interface FontFamilyDefinition {
  family: string[];
  fallback: string[];
}
