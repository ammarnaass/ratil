/**
 * رتل - Ratil
 * منظومة الخطوط والطباعة (Typography Stack)
 * features/theme/constants/typography.constants.ts
 */

export const TYPOGRAPHY = {
  fonts: {
    quranHafs: "'KFGQPC Uthmanic Hafs', 'Amiri', serif",
    quranWarsh: "'KFGQPC Uthmanic Warsh', 'Amiri', serif",
    ui: "'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  quranSizes: {
    mobile: {
      sm: '20px',
      md: '22px', // الافتراضي للجوال
      lg: '26px',
    },
    desktop: {
      sm: '22px',
      md: '26px', // الافتراضي للكمبيوتر واللوحي
      lg: '32px',
    },
  },
  lineHeights: {
    quranMobile: '2.2',
    quranDesktop: '2.3',
    ui: '1.5',
  },
} as const;
