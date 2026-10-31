'use client';

/**
 * رتل - Ratil
 * شريط التحكم التفاعلي في تكبير وتصغير خط المصحف (Font Scale Control)
 * features/theme/components/FontScaleControl.tsx
 */

import React from 'react';
import { Type, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useQuranFont } from '../hooks/useQuranFont';
import { QURAN_FONT_SCALES, DEFAULT_QURAN_FONT_SIZE_LEVEL } from '../tokens/typography.tokens';

export interface FontScaleControlProps {
  className?: string;
  compact?: boolean;
}

export function FontScaleControl({ className = '', compact = false }: FontScaleControlProps) {
  const { sizeLevel, increaseFontSize, decreaseFontSize, setSizeLevel } = useQuranFont();
  const currentConfig = QURAN_FONT_SCALES[sizeLevel];

  const isSmallest = sizeLevel === 'sm';
  const isLargest = sizeLevel === 'xl';
  const isDefault = sizeLevel === DEFAULT_QURAN_FONT_SIZE_LEVEL;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 p-1 rounded-xl bg-surface-container border border-surface-container-high text-xs ${className}`}>
        <button
          onClick={decreaseFontSize}
          disabled={isSmallest}
          className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="تصغير خط الآيات"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <span className="px-1.5 text-[11px] font-semibold text-primary">
          {currentConfig.label}
        </span>

        <button
          onClick={increaseFontSize}
          disabled={isLargest}
          className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="تكبير خط الآيات"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 p-1.5 rounded-2xl bg-surface-container/80 backdrop-blur-md border border-surface-container-high shadow-xs ${className}`}
      role="group"
      aria-label="التحكم في حجم خط النص القرآني"
    >
      <div className="flex items-center gap-1.5 pr-2 pl-1 text-xs text-on-surface-variant font-medium">
        <Type className="w-4 h-4 text-primary" />
        <span className="hidden sm:inline">حجم الخط:</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={decreaseFontSize}
          disabled={isSmallest}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs font-bold text-on-surface disabled:opacity-35 disabled:cursor-not-allowed transition-all"
          title="تصغير خط المصحف"
          aria-label="تصغير خط المصحف"
        >
          <ZoomOut className="w-3.5 h-3.5" />
          <span>أ-</span>
        </button>

        <span className="px-2.5 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-lg min-w-[75px] text-center">
          {currentConfig.label}
        </span>

        <button
          onClick={increaseFontSize}
          disabled={isLargest}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs font-bold text-on-surface disabled:opacity-35 disabled:cursor-not-allowed transition-all"
          title="تكبير خط المصحف"
          aria-label="تكبير خط المصحف"
        >
          <span>أ+</span>
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {!isDefault && (
        <button
          onClick={() => setSizeLevel(DEFAULT_QURAN_FONT_SIZE_LEVEL)}
          className="p-1.5 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          title="استعادة الحجم القياسي"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default FontScaleControl;
