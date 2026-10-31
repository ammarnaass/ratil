'use client';

/**
 * رتل - Ratil
 * شريط التحكم واختيار القارئ والبحث والإجراءات لتبويب الصوتيات
 * features/admin/components/AudioToolbar.tsx
 */

import React from 'react';
import { Sparkles, Plus, ExternalLink, Search, Music } from 'lucide-react';
import type { Reciter } from '@/lib/types';

export interface AudioToolbarProps {
  reciters: Reciter[];
  selectedReciterId: string;
  setSelectedReciterId: (id: string) => void;
  onOpenBulkSeed: () => void;
  onOpenAddSurah: () => void;
  archiveId: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalSurahs: number;
  customCount: number;
}

export function AudioToolbar({
  reciters,
  selectedReciterId,
  setSelectedReciterId,
  onOpenBulkSeed,
  onOpenAddSurah,
  archiveId,
  searchQuery,
  setSearchQuery,
  totalSurahs,
  customCount,
}: AudioToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* صف اختيار القارئ والإجراءات الرئيسية */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-on-surface">استعراض سور القارئ:</span>
          <div className="flex items-center gap-1.5 bg-surface-container p-1 rounded-xl border border-surface-container-high flex-wrap">
            {reciters.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedReciterId(r.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedReciterId === r.id
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {r.name.replace('الشيخ ', '')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenBulkSeed}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-on-primary hover:opacity-90 transition-all text-xs font-bold shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>بذر سور المصحف (114 سورة)</span>
          </button>

          <button
            onClick={onOpenAddSurah}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs text-on-surface border border-surface-container-high"
          >
            <Plus className="w-3.5 h-3.5 text-primary" />
            <span>تحديث رابط سورة</span>
          </button>

          <a
            href={`https://archive.org/details/${archiveId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-primary hover:underline font-mono"
          >
            <span>مجموعة Archive.org</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* شريط البحث وإحصائيات السور */}
      <div className="p-4 rounded-2xl bg-surface-container border border-surface-container-high flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-outline absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث في سور القارئ (مثال: الكهف أو 18)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-2 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest text-xs outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-on-surface-variant flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-primary" />
            <span>
              المتاح:{' '}
              <strong className="text-on-surface font-mono">{customCount || totalSurahs}</strong> / {totalSurahs} سورة
            </span>
          </span>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
            انقر على أي سورة لتعديل رابطها واختبارها فوراً
          </span>
        </div>
      </div>
    </div>
  );
}

export default AudioToolbar;
