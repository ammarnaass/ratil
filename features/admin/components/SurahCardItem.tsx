'use client';

/**
 * رتل - Ratil
 * بطاقة السورة المفردة في شبكة الصوتيات مع أزرار المعاينة والتعديل المباشر
 * features/admin/components/SurahCardItem.tsx
 */

import React from 'react';
import { Play, Pause, Edit3, CheckCircle2 } from 'lucide-react';

export interface SurahCardItemProps {
  surahNumber: number;
  surahName: string;
  pad: string;
  audioUrl?: string;
  isRegistered?: boolean;
  isActivePreview: boolean;
  onTogglePreview: () => void;
  onOpenEdit: () => void;
}

export function SurahCardItem({
  surahNumber,
  surahName,
  pad,
  audioUrl,
  isRegistered = true,
  isActivePreview,
  onTogglePreview,
  onOpenEdit,
}: SurahCardItemProps) {
  return (
    <div
      className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 group ${
        isActivePreview
          ? 'bg-primary/10 border-primary ring-1 ring-primary/40 shadow-xs'
          : 'bg-surface-container-high hover:bg-surface-container-highest border-surface-container-highest'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-outline font-bold">
            #{surahNumber}
          </span>
          <span className="font-bold text-xs text-on-surface truncate max-w-[90px]">
            {surahName}
          </span>
        </div>
        {isRegistered && (
          <span title="مسجلة في Neon">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary/70 shrink-0" />
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
        <span className="font-mono text-[10px] text-outline truncate max-w-[80px]" title={audioUrl}>
          {pad}.mp3
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onTogglePreview}
            className={`p-1.5 rounded-lg transition-colors ${
              isActivePreview
                ? 'bg-primary text-on-primary'
                : 'hover:bg-surface-container text-on-surface-variant hover:text-primary'
            }`}
            title="تشغيل المعاينة المباشرة"
          >
            {isActivePreview ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={onOpenEdit}
            className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
            title="تعديل رابط السورة وتخصيصه"
          >
            <Edit3 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default SurahCardItem;
