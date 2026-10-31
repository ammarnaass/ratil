'use client';

/**
 * رتل - Ratil
 * زر التبديل بين الوضعين الليلي والنهاري (Theme Toggle Button)
 * features/theme/components/ThemeToggle.tsx
 */

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = true }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      id="navbar-theme-toggle"
      className={`flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-surface-container-high transition-all focus:outline-none active:scale-95 shadow-sm shrink-0 ${className}`}
      title={isDark ? 'التبديل إلى الوضع المشرق (النهاري)' : 'التبديل إلى الوضع المظلم (الليلي)'}
      aria-label={isDark ? 'التبديل إلى الوضع المشرق' : 'التبديل إلى الوضع المظلم'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-primary transition-transform duration-300 hover:-rotate-12" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-semibold text-on-surface select-none hidden sm:inline whitespace-nowrap">
          {isDark ? 'المشرق' : 'المظلم'}
        </span>
      )}
    </button>
  );
}

export default ThemeToggle;
