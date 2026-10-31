'use client';

/**
 * رتل - Ratil
 * بطاقة عرض منظومة الألوان ومطابقتها للمعايير (Color Palette Showcase)
 * features/theme/components/ColorPaletteShowcase.tsx
 */

import React from 'react';
import { ShieldCheck, Eye } from 'lucide-react';
import { COLOR_TOKENS_LIST } from '../constants/colors.constants';
import { useTheme } from '../hooks/useTheme';

export function ColorPaletteShowcase() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="w-full flex flex-col gap-4 p-6 rounded-3xl bg-surface-container/60 border border-surface-container-high">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          <h3 className="text-base font-bold text-on-surface">محددات الهوية البصرية ونظام الألوان</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>مطابق لمعيار WCAG AAA</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
        {COLOR_TOKENS_LIST.map((token) => {
          const currentHex = resolvedTheme === 'dark' ? token.darkHex : token.lightHex;
          return (
            <div
              key={token.variable}
              className="flex flex-col gap-2 p-3.5 rounded-2xl bg-surface border border-surface-container-high shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">{token.name}</span>
                <span
                  className="w-5 h-5 rounded-lg border border-surface-container-high shadow-inner"
                  style={{ backgroundColor: currentHex }}
                  aria-hidden="true"
                />
              </div>

              <p className="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed">
                {token.description}
              </p>

              <div className="flex items-center justify-between text-[10px] text-outline pt-2 border-t border-surface-container-high/50 font-mono">
                <span>{currentHex}</span>
                {token.contrastRatio && (
                  <span className="text-primary font-sans font-semibold">{token.contrastRatio}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
