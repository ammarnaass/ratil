'use client';

/**
 * رتل - Ratil
 * البوابة العامة لنظام التصميم والمظهر والألوان والخطوط (Design System Public API)
 * features/theme/index.ts
 */

// ─── 1. الأنواع (Types) ───
export type {
  ThemeMode,
  ThemeContextType,
  ColorToken,
  QuranTypographyToken,
  QuranFontSizeLevel,
  QuranFontRiwaya,
  QuranFontScaleConfig,
  QuranFontPreferences,
  QuranFontContextType,
  DualThemeColorToken,
  ThemeColorTokenDefinition,
} from './types/theme.types';

// ─── 2. محددات التصميم (Tokens - Single Source of Truth) ───
export {
  COLOR_TOKENS,
  QURAN_COLORS,
} from './tokens/colors.tokens';

export {
  FONT_FAMILIES,
  QURAN_FONT_SCALES,
  DEFAULT_QURAN_FONT_SIZE_LEVEL,
  QURAN_FONT_SIZE_STORAGE_KEY,
} from './tokens/typography.tokens';

export { ELEVATION_TOKENS } from './tokens/elevation.tokens';

export {
  TAILWIND_COLOR_TOKENS,
  TAILWIND_FONT_FAMILIES,
} from './tokens/tailwind-bindings';

// ─── 3. الثوابت التوافقية (Backward-Compatible Constants) ───
export {
  THEME_STORAGE_KEY,
  DEFAULT_THEME,
  THEME_LABELS,
} from './constants/theme.constants';
export {
  RATIL_COLORS,
  COLOR_TOKENS_LIST,
} from './constants/colors.constants';
export { TYPOGRAPHY } from './constants/typography.constants';

// ─── 4. السياقات والمزودات (Context & Providers) ───
export { ThemeContext } from './context/theme.context';
export { QuranFontContext } from './context/quran-font.context';
export { ThemeProvider } from './components/ThemeProvider';

// ─── 5. الخطافات التفاعلية (Hooks) ───
export { useTheme } from './hooks/useTheme';
export { useQuranFont } from './hooks/useQuranFont';

// ─── 6. المكونات البصرية (Components) ───
export { ThemeToggle } from './components/ThemeToggle';
export { FontScaleControl } from './components/FontScaleControl';
export { ColorPaletteShowcase } from './components/ColorPaletteShowcase';

// ─── 7. الأدوات المساعدة (Utils) ───
export {
  getSystemTheme,
  getStoredTheme,
  applyThemeToDom,
} from './utils/theme.utils';
export { hexToRgbString, createColorValue } from './utils/color.utils';
