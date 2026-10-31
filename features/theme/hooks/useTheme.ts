'use client';

/**
 * رتل - Ratil
 * خطاف استهلاك المظهر والتبديل (useTheme Hook)
 * features/theme/hooks/useTheme.ts
 */

import { useContext } from 'react';
import { ThemeContext } from '../context/theme.context';
import type { ThemeContextType } from '../types/theme.types';

const defaultThemeContext: ThemeContextType = {
  theme: 'dark',
  resolvedTheme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    return defaultThemeContext;
  }
  return context;
}
