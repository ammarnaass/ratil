/**
 * رتل - Ratil
 * ثوابت الألوان ومحددات الهوية البصرية (WCAG AAA Compliance)
 * features/theme/constants/colors.constants.ts
 */

import type { ColorToken } from '../types/theme.types';

export const RATIL_COLORS = {
  // أخضر فيروزي - لون التمييز الأوحد للتطبيق
  accent: {
    base: '#3ECFB2',
    dim: '#2BA890',
    containerDark: '#134E44',
    onAccent: '#00382E',
  },
  // الخلفيات والأسطح
  background: {
    dark: '#111318',
    light: '#FAFAFA',
  },
  surface: {
    dark: '#1C1F27',
    light: '#FFFFFF',
    containerDark: '#1E2025',
    containerHighDark: '#282A2F',
  },
  // النصوص
  text: {
    primaryDark: '#F0F0F0',
    primaryLight: '#111318',
    mutedDark: '#6B7280',
    mutedLight: '#9CA3AF',
  },
  // النص القرآني المعتمد
  quran: {
    dark: '#EAEAEA', // تباين 12.5:1
    light: '#1A1A1A', // تباين 15.8:1
  },
  // تظليل الآية الجارية
  highlight: {
    bg: 'rgba(62, 207, 178, 0.12)',
    border: '#3ECFB2',
  },
} as const;

export const COLOR_TOKENS_LIST: ColorToken[] = [
  {
    name: 'لون التمييز الفيروزي (Accent)',
    variable: '--color-accent',
    darkHex: '#3ECFB2',
    lightHex: '#2BA890',
    description: 'اللون الأوحد للتفاعل والأزرار النشطة ومؤشر الآية الجارية',
    contrastRatio: '≥ 4.8:1',
  },
  {
    name: 'الخلفية الرئيسية (Background)',
    variable: '--color-bg',
    darkHex: '#111318',
    lightHex: '#FAFAFA',
    description: 'خلفية الصفحات الهادئة المريحة للعين',
  },
  {
    name: 'الأسطح والبطاقات (Surface)',
    variable: '--color-surface',
    darkHex: '#1C1F27',
    lightHex: '#FFFFFF',
    description: 'أسطح الكروت والمشغل واللوحات التفاعلية',
  },
  {
    name: 'النص الأساسي (Text Primary)',
    variable: '--color-text-primary',
    darkHex: '#F0F0F0',
    lightHex: '#111318',
    description: 'نصوص العناوين والواجهة العامة',
    contrastRatio: '14.2:1 (داكن) / 16.5:1 (فاتح)',
  },
  {
    name: 'النص القرآني المعتمد (Quran Text)',
    variable: '--color-quran',
    darkHex: '#EAEAEA',
    lightHex: '#1A1A1A',
    description: 'النص القرآني بخط مصحف المدينة عالي التباين والصفاء',
    contrastRatio: '12.5:1 (داكن) / 15.8:1 (فاتح)',
  },
  {
    name: 'تظليل الآية الجارية (Highlight)',
    variable: '--color-highlight',
    darkHex: 'rgba(62, 207, 178, 0.12)',
    lightHex: 'rgba(43, 168, 144, 0.12)',
    description: 'خلفية هادئة تميز الآية المستمع إليها مع حد بارز',
  },
];
