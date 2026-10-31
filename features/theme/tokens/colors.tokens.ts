/**
 * رتل - Ratil
 * المصدر الموحد لمحددات الألوان (Single Source of Truth for Colors)
 * features/theme/tokens/colors.tokens.ts
 */

import { hexToRgbString } from '../utils/color.utils';
import type { ThemeColorTokenDefinition } from '../types/colors.types';

/**
 * محددات الألوان الثنائية (الوضع الليلي والنهاري)
 */
export const COLOR_TOKENS = {
  // ─── 1. لون التمييز الأوحد والأساسي (Primary / Accent Turquoise) ───
  primary: {
    name: 'لون التمييز الفيروزي (Accent)',
    variable: '--color-primary-rgb',
    darkHex: '#3ECFB2',
    lightHex: '#0D9488',
    darkRgb: hexToRgbString('#3ECFB2'),
    lightRgb: hexToRgbString('#0D9488'),
    description: 'اللون الرئيسي للتفاعل والأزرار النشطة وشريط التقدم',
  },
  primaryFocus: {
    name: 'لون التمييز المركز (Primary Focus)',
    variable: '--color-primary-focus-rgb',
    darkHex: '#61ECC5',
    lightHex: '#0F766E',
    darkRgb: hexToRgbString('#61ECC5'),
    lightRgb: hexToRgbString('#0F766E'),
    description: 'حالة التحويم والتركيز للون الرئيسي',
  },
  primaryContainer: {
    name: 'حاوية التمييز (Primary Container)',
    variable: '--color-primary-container-rgb',
    darkHex: '#134E44',
    lightHex: '#CCFBF1',
    darkRgb: hexToRgbString('#134E44'),
    lightRgb: hexToRgbString('#CCFBF1'),
    description: 'خلفيات الشارات وعناصر التحديد',
  },
  onPrimary: {
    name: 'نص فوق التمييز (On Primary)',
    variable: '--color-on-primary-rgb',
    darkHex: '#00382E',
    lightHex: '#FFFFFF',
    darkRgb: hexToRgbString('#00382E'),
    lightRgb: hexToRgbString('#FFFFFF'),
    description: 'النص والأيقونات الظاهرة فوق اللون الفيروزي',
  },
  onPrimaryContainer: {
    name: 'نص حاوية التمييز',
    variable: '--color-on-primary-container-rgb',
    darkHex: '#70F9DA',
    lightHex: '#115E59',
    darkRgb: hexToRgbString('#70F9DA'),
    lightRgb: hexToRgbString('#115E59'),
    description: 'النص فوق خلفيات الشارات الفيروزية',
  },

  // ─── 2. الخلفيات والأسطح (Background & Surfaces) ───
  background: {
    name: 'الخلفية العامة (Background)',
    variable: '--color-background-rgb',
    darkHex: '#111318',
    lightHex: '#F8FAFC',
    darkRgb: hexToRgbString('#111318'),
    lightRgb: hexToRgbString('#F8FAFC'),
    description: 'الخلفية الأساسية لكامل التطبيق',
  },
  surface: {
    name: 'السطح الأساسي (Surface)',
    variable: '--color-surface-rgb',
    darkHex: '#111318',
    lightHex: '#FFFFFF',
    darkRgb: hexToRgbString('#111318'),
    lightRgb: hexToRgbString('#FFFFFF'),
    description: 'سطح المكونات الأساسية وأشرطة التنقل',
  },
  surfaceContainerLowest: {
    name: 'أدنى طبقة للسطح',
    variable: '--color-surface-container-lowest-rgb',
    darkHex: '#0C0E13',
    lightHex: '#FFFFFF',
    darkRgb: hexToRgbString('#0C0E13'),
    lightRgb: hexToRgbString('#FFFFFF'),
    description: 'الأسطح الغائرة أو القوائم المنسدلة',
  },
  surfaceContainerLow: {
    name: 'سطح حاوية منخفض',
    variable: '--color-surface-container-low-rgb',
    darkHex: '#1A1B21',
    lightHex: '#F8FAFC',
    darkRgb: hexToRgbString('#1A1B21'),
    lightRgb: hexToRgbString('#F8FAFC'),
    description: 'أسطح الأقسام الثانوية',
  },
  surfaceContainer: {
    name: 'سطح الحاوية الافتراضي',
    variable: '--color-surface-container-rgb',
    darkHex: '#1E2025',
    lightHex: '#F1F5F9',
    darkRgb: hexToRgbString('#1E2025'),
    lightRgb: hexToRgbString('#F1F5F9'),
    description: 'الكروت وبطاقات السور والقرّاء',
  },
  surfaceContainerHigh: {
    name: 'سطح حاوية مرتفع',
    variable: '--color-surface-container-high-rgb',
    darkHex: '#282A2F',
    lightHex: '#E2E8F0',
    darkRgb: hexToRgbString('#282A2F'),
    lightRgb: hexToRgbString('#E2E8F0'),
    description: 'حدود الكروت والحالات المرتفعة عند التحويم',
  },
  surfaceContainerHighest: {
    name: 'أعلى طبقة للسطح',
    variable: '--color-surface-container-highest-rgb',
    darkHex: '#33353A',
    lightHex: '#CBD5E1',
    darkRgb: hexToRgbString('#33353A'),
    lightRgb: hexToRgbString('#CBD5E1'),
    description: 'الفواصل البارزة والحقول المدخلة',
  },

  // ─── 3. ألوان النصوص والواجهة (Typography & On Surface) ───
  onSurface: {
    name: 'النص الأساسي (On Surface)',
    variable: '--color-on-surface-rgb',
    darkHex: '#E2E2E9',
    lightHex: '#0F172A',
    darkRgb: hexToRgbString('#E2E2E9'),
    lightRgb: hexToRgbString('#0F172A'),
    description: 'عناوين السور والنصوص الرئيسية',
  },
  onSurfaceVariant: {
    name: 'النص الثانوي (Muted Text)',
    variable: '--color-on-surface-variant-rgb',
    darkHex: '#BBCAAC',
    lightHex: '#475569',
    darkRgb: hexToRgbString('#BBCAAC'),
    lightRgb: hexToRgbString('#475569'),
    description: 'أرقام الآيات، أسماء السور اللاتينية، والنصوص الوصفية',
  },
  outline: {
    name: 'حدود الإطار (Outline)',
    variable: '--color-outline-rgb',
    darkHex: '#85948F',
    lightHex: '#94A3B8',
    darkRgb: hexToRgbString('#85948F'),
    lightRgb: hexToRgbString('#94A3B8'),
    description: 'حدود الحقول والأيقونات الخافتة',
  },

  // ─── 4. ألوان الأخطاء والتنبيهات ───
  error: {
    name: 'لون الخطأ (Error)',
    variable: '--color-error-rgb',
    darkHex: '#FFB4AB',
    lightHex: '#DC2626',
    darkRgb: hexToRgbString('#FFB4AB'),
    lightRgb: hexToRgbString('#DC2626'),
    description: 'رسائل وتنبيهات الخطأ والمصادقة',
  },
} as const;

/**
 * ألوان النص القرآني المتخصصة
 */
export const QURAN_COLORS = {
  textDark: '#EAEAEA',
  textLight: '#1A1A1A',
  highlightBg: 'rgba(62, 207, 178, 0.12)',
  highlightBorder: '#3ECFB2',
} as const;
