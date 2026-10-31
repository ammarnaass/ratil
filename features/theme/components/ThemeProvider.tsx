'use client';

/**
 * رتل - Ratil
 * مزوّد سياق المظهر وتفضيلات خط المصحف (Theme & Quran Font Provider)
 * features/theme/components/ThemeProvider.tsx
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ThemeContext } from '../context/theme.context';
import { QuranFontContext } from '../context/quran-font.context';
import type {
  ThemeMode,
  ThemeContextType,
  QuranFontSizeLevel,
  QuranFontRiwaya,
  QuranFontContextType,
} from '../types/theme.types';
import { THEME_STORAGE_KEY } from '../constants/theme.constants';
import {
  QURAN_FONT_SCALES,
  DEFAULT_QURAN_FONT_SIZE_LEVEL,
  QURAN_FONT_SIZE_STORAGE_KEY,
} from '../tokens/typography.tokens';
import { getSystemTheme, getStoredTheme, applyThemeToDom } from '../utils/theme.utils';

export { ThemeContext, QuranFontContext };

const FONT_LEVELS: QuranFontSizeLevel[] = ['sm', 'md', 'lg', 'xl'];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // ─── 1. حالة المظهر (Dark / Light) ───
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

  // ─── 2. حالة خط وتفضيلات المصحف (Quran Font Preferences) ───
  const [sizeLevel, setSizeLevelState] = useState<QuranFontSizeLevel>(DEFAULT_QURAN_FONT_SIZE_LEVEL);
  const [riwaya, setRiwayaState] = useState<QuranFontRiwaya>('hafs');

  useEffect(() => {
    // استرجاع المظهر المحفوظ
    const saved = getStoredTheme();
    setThemeState(saved);
    const resolved = saved === 'system' ? getSystemTheme() : saved;
    setResolvedTheme(resolved);
    applyThemeToDom(resolved);

    // استرجاع تفضيل حجم خط المصحف
    try {
      const savedFontSize = localStorage.getItem(QURAN_FONT_SIZE_STORAGE_KEY) as QuranFontSizeLevel | null;
      if (savedFontSize && FONT_LEVELS.includes(savedFontSize)) {
        setSizeLevelState(savedFontSize);
      }
    } catch {
      // تجاهل أخطاء التخزين
    }
  }, []);

  // الاستماع لتغييرات النظام في حال اختيار "system"
  useEffect(() => {
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => {
      const newResolved = e.matches ? 'dark' : 'light';
      setResolvedTheme(newResolved);
      applyThemeToDom(newResolved);
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [theme]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (err) {
      console.warn('Failed to save theme preference', err);
    }
    const resolved = newTheme === 'system' ? getSystemTheme() : newTheme;
    setResolvedTheme(resolved);
    applyThemeToDom(resolved);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }, [resolvedTheme, setTheme]);

  const setSizeLevel = useCallback((level: QuranFontSizeLevel) => {
    setSizeLevelState(level);
    try {
      localStorage.setItem(QURAN_FONT_SIZE_STORAGE_KEY, level);
    } catch {
      // تجاهل
    }
  }, []);

  const increaseFontSize = useCallback(() => {
    const currentIndex = FONT_LEVELS.indexOf(sizeLevel);
    if (currentIndex < FONT_LEVELS.length - 1) {
      setSizeLevel(FONT_LEVELS[currentIndex + 1]);
    }
  }, [sizeLevel, setSizeLevel]);

  const decreaseFontSize = useCallback(() => {
    const currentIndex = FONT_LEVELS.indexOf(sizeLevel);
    if (currentIndex > 0) {
      setSizeLevel(FONT_LEVELS[currentIndex - 1]);
    }
  }, [sizeLevel, setSizeLevel]);

  const setRiwaya = useCallback((newRiwaya: QuranFontRiwaya) => {
    setRiwayaState(newRiwaya);
  }, []);

  const currentScale = QURAN_FONT_SCALES[sizeLevel];

  const fontSizeClass =
    sizeLevel === 'sm'
      ? 'text-lg sm:text-xl'
      : sizeLevel === 'md'
      ? 'text-xl sm:text-2xl'
      : sizeLevel === 'lg'
      ? 'text-2xl sm:text-3xl'
      : 'text-3xl sm:text-4xl';

  const themeContextValue: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };

  const quranFontContextValue: QuranFontContextType = {
    preferences: { sizeLevel, riwaya },
    sizeLevel,
    fontSizeClass,
    mobilePx: currentScale.mobileSize,
    desktopPx: currentScale.desktopSize,
    increaseFontSize,
    decreaseFontSize,
    setSizeLevel,
    setRiwaya,
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <QuranFontContext.Provider value={quranFontContextValue}>
        {children}
      </QuranFontContext.Provider>
    </ThemeContext.Provider>
  );
}
