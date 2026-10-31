/**
 * رتل - Ratil
 * محددات الظلال والشفافيات الزجاجية والتوهج (Elevation & Glass Tokens)
 * features/theme/tokens/elevation.tokens.ts
 */

export const ELEVATION_TOKENS = {
  glass: {
    navbar: 'backdrop-blur-md bg-surface/90 border-b border-surface-container-high',
    card: 'backdrop-blur-md bg-surface-container/70 border border-surface-container-high hover:border-primary/40',
    modal: 'backdrop-blur-xl bg-surface-container-lowest/90 border border-surface-container-high shadow-2xl',
    bottomSheet: 'backdrop-blur-2xl bg-surface-container/95 border-t border-surface-container-high shadow-2xl',
  },
  glow: {
    primary: 'shadow-lg shadow-primary/20',
    primaryLg: 'shadow-2xl shadow-primary/30',
    inner: 'shadow-inner border border-primary/20',
  },
} as const;
