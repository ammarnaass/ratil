/**
 * رتل - Ratil
 * تعريفات أنواع الألوان ومحددات الهوية البصرية (Color Token Types)
 * features/theme/types/colors.types.ts
 */

export interface ColorModeValues {
  hex: string;
  rgb: string; // e.g. "62 207 178"
}

export interface DualThemeColorToken {
  name: string;
  variable: string;
  dark: ColorModeValues;
  light: ColorModeValues;
  description: string;
  contrastRatio?: string;
}

export interface ThemeColorTokenDefinition {
  name: string;
  variable: string;
  darkHex: string;
  lightHex: string;
  darkRgb: string;
  lightRgb: string;
  description: string;
}

export interface SemanticColorRole {
  base: ColorModeValues;
  focus?: ColorModeValues;
  container: ColorModeValues;
  onColor: ColorModeValues;
  onContainer?: ColorModeValues;
}

export interface QuranColorRole {
  text: ColorModeValues;
  highlightBg: string;
  highlightBorder: string;
}
