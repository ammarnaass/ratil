'use client';

/**
 * رتل - Ratil
 * بطاقة معلومات السورة والقارئ والرواية الحالية
 * features/player/components/PlayerSurahInfo.tsx
 */

import React from 'react';
import { ListMusic, User } from 'lucide-react';
import type { Reciter } from '@/lib/types';
import { getRiwayaBadge } from '../utils/player.utils';

export interface PlayerSurahInfoProps {
  surahName: string;
  currentReciter: Reciter;
  onToggleReciterMenu: () => void;
}

export function PlayerSurahInfo({
  surahName,
  currentReciter,
  onToggleReciterMenu,
}: PlayerSurahInfoProps) {
  const riwayaBadge = getRiwayaBadge(currentReciter.riwaya);

  return (
    <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-surface-container flex items-center justify-center text-primary border border-surface-container-high shrink-0">
          <ListMusic className="w-5 h-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-on-surface truncate">
              سورة {surahName}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
              {riwayaBadge}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant truncate">
            <User className="w-3.5 h-3.5 text-outline shrink-0" />
            <span className="truncate">{currentReciter.name}</span>
          </div>
        </div>
      </div>

      {/* زر القارئ على شاشات الجوال */}
      <button
        onClick={onToggleReciterMenu}
        className="md:hidden p-2 rounded-xl bg-surface-container text-on-surface-variant text-xs"
        title="تغيير القارئ"
      >
        القرّاء
      </button>
    </div>
  );
}

export default PlayerSurahInfo;
