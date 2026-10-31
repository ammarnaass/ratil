/**
 * رتل - Ratil
 * جسر الربط البرمجي لتغذية Tailwind CSS بمحددات التصميم (Tailwind Bindings)
 * features/theme/tokens/tailwind-bindings.ts
 */

export const TAILWIND_COLOR_TOKENS = {
  background: 'rgb(var(--color-background-rgb) / <alpha-value>)',
  surface: 'rgb(var(--color-surface-rgb) / <alpha-value>)',
  'surface-dim': 'rgb(var(--color-surface-dim-rgb) / <alpha-value>)',
  'surface-bright': 'rgb(var(--color-surface-bright-rgb) / <alpha-value>)',
  'surface-container-lowest': 'rgb(var(--color-surface-container-lowest-rgb) / <alpha-value>)',
  'surface-container-low': 'rgb(var(--color-surface-container-low-rgb) / <alpha-value>)',
  'surface-container': 'rgb(var(--color-surface-container-rgb) / <alpha-value>)',
  'surface-container-high': 'rgb(var(--color-surface-container-high-rgb) / <alpha-value>)',
  'surface-container-highest': 'rgb(var(--color-surface-container-highest-rgb) / <alpha-value>)',
  'surface-variant': 'rgb(var(--color-surface-variant-rgb) / <alpha-value>)',
  primary: 'rgb(var(--color-primary-rgb) / <alpha-value>)',
  'primary-focus': 'rgb(var(--color-primary-focus-rgb) / <alpha-value>)',
  'primary-container': 'rgb(var(--color-primary-container-rgb) / <alpha-value>)',
  'on-primary': 'rgb(var(--color-on-primary-rgb) / <alpha-value>)',
  'on-primary-container': 'rgb(var(--color-on-primary-container-rgb) / <alpha-value>)',
  secondary: 'rgb(var(--color-secondary-rgb) / <alpha-value>)',
  'secondary-container': 'rgb(var(--color-secondary-container-rgb) / <alpha-value>)',
  'on-secondary': 'rgb(var(--color-on-secondary-rgb) / <alpha-value>)',
  tertiary: 'rgb(var(--color-tertiary-rgb) / <alpha-value>)',
  'on-surface': 'rgb(var(--color-on-surface-rgb) / <alpha-value>)',
  'on-surface-variant': 'rgb(var(--color-on-surface-variant-rgb) / <alpha-value>)',
  outline: 'rgb(var(--color-outline-rgb) / <alpha-value>)',
  'outline-variant': 'rgb(var(--color-outline-variant-rgb) / <alpha-value>)',
  error: 'rgb(var(--color-error-rgb) / <alpha-value>)',
  'error-container': 'rgb(var(--color-error-container-rgb) / <alpha-value>)',
} as const;

export const TAILWIND_FONT_FAMILIES = {
  sans: ['"IBM Plex Sans Arabic"', 'sans-serif'],
  quran: ['"KFGQPC Uthmanic Hafs"', 'Amiri', 'serif'],
  arabic: ['"IBM Plex Sans Arabic"', 'sans-serif'],
} as const;
