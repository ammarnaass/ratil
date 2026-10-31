'use client';

/**
 * رتل - Ratil
 * قائمة اختيار القارئ المعتمد والرواية القرآنية
 * features/player/components/ReciterSelectMenu.tsx
 */

import React from 'react';
import { User, CheckCircle2 } from 'lucide-react';
import type { Reciter } from '@/lib/types';
import { getRiwayaBadge } from '../utils/player.utils';

export interface ReciterSelectMenuProps {
  reciters: Reciter[];
  currentReciter: Reciter;
  isOpen: boolean;
  onToggle: () => void;
  onSelectReciter: (id: string) => void;
}

export function ReciterSelectMenu({
  reciters,
  currentReciter,
  isOpen,
  onToggle,
  onSelectReciter,
}: ReciterSelectMenuProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs text-on-surface border border-surface-container-high transition-colors"
      >
        <User className="w-3.5 h-3.5 text-primary" />
        <span className="truncate max-w-[140px]">{currentReciter.name}</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 w-72 bg-surface-container-low rounded-2xl p-2 border border-surface-container-high shadow-2xl z-50 flex flex-col gap-1">
          <div className="text-[11px] font-semibold text-outline px-3 py-1">
            اختر القارئ المعتمد
          </div>
          {reciters.map((r) => {
            const isSelected = r.id === currentReciter.id;
            return (
              <button
                key={r.id}
                onClick={() => onSelectReciter(r.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-right text-xs transition-colors ${
                  isSelected
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'hover:bg-surface-container text-on-surface'
                }`}
              >
                <div className="flex flex-col">
                  <span>{r.name}</span>
                  <span className="text-[10px] text-on-surface-variant font-normal">
                    {getRiwayaBadge(r.riwaya)}
                  </span>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ReciterSelectMenu;
