/**
 * رتل - Ratil
 * دوال مساعدة لإدارة المظهر وتحديث الـ DOM
 * features/theme/utils/theme.utils.ts
 */

import { THEME_STORAGE_KEY } from '../constants/theme.constants';
import type { ThemeMode } from '../types/theme.types';

export function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  try {
    const val = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (val === 'dark' || val === 'light' || val === 'system') {
      return val;
    }
  } catch (err) {
    console.warn('Failed to read theme from localStorage', err);
  }
  return 'dark';
}

export function applyThemeToDom(resolved: 'dark' | 'light'): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';
  }
}
