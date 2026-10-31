'use client';

/**
 * رتل - Ratil
 * شريط التحكم واختيار القارئ والبحث والإجراءات لتبويب الصوتيات
 * features/admin/components/AudioToolbar.tsx
 */

import React from 'react';
import { Sparkles, Plus, ExternalLink, Search, LayoutGrid, List, X } from 'lucide-react';
import type { Reciter } from '@/lib/types';

export type SurahFilterType = 'all' | 'meccan' | 'medinan' | 'neon';

export interface AudioToolbarProps {
  reciters: Reciter[];
  selectedReciterId: string;
  setSelectedReciterId: (id: string) => void;
  onOpenBulkSeed: () => void;
  onOpenAddSurah: () => void;
  archiveId: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  filterType: SurahFilterType;
  setFilterType: (filter: SurahFilterType) => void;
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
  viewMode,
  setViewMode,
  filterType,
  setFilterType,
  totalSurahs,
  customCount,
}: AudioToolbarProps) {
  return (
    <div className="flex flex-col gap-3.5">
      {/* 1. صف اختيار القارئ والإجراءات الرئيسية */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* اختيار القارئ المفضل */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-on-surface">القارئ:</span>
          <div className="flex items-center gap-1.5 bg-surface-container p-1 rounded-2xl border border-surface-container-high/80 flex-wrap">
            {reciters.map((r) => {
              const isSelected = selectedReciterId === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedReciterId(r.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary text-on-primary shadow-xs shadow-primary/20 ring-1 ring-primary/40'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <span>{r.name.replace('الشيخ ', '')}</span>
                  {r.riwaya && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-black/20 text-on-primary' : 'bg-surface-container-high text-outline'
                    }`}>
                      {r.riwaya.split(' ')[0]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* أزرار الإجراءات الرئيسية */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenBulkSeed}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-primary to-primary-container text-on-primary hover:opacity-90 transition-all text-xs font-bold shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>بذر سور المصحف (114 سورة)</span>
          </button>

          <button
            onClick={onOpenAddSurah}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-surface-container hover:bg-surface-container-high text-xs text-on-surface font-semibold border border-surface-container-high transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-primary" />
            <span>تحديث رابط سورة</span>
          </button>

          <a
            href={`https://archive.org/details/${archiveId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-surface-container hover:bg-surface-container-high text-xs text-primary font-mono border border-surface-container-high transition-all"
            title="فتح المجموعة في أرشيف الإنترنت"
          >
            <span>Archive.org</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 2. شريط البحث والفلترة وتبديل طريقة العرض */}
      <div className="p-3.5 rounded-3xl bg-surface-container border border-surface-container-high/80 flex items-center justify-between gap-3 flex-wrap shadow-xs">
        {/* شريط البحث المباشر */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-4 h-4 text-outline absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم أو الرقم (مثال: الكهف أو 18)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-8 py-2 rounded-2xl bg-surface-container-high text-on-surface border border-surface-container-highest text-xs outline-hidden focus:ring-1 focus:ring-primary font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* فلاتر التصنيف */}
        <div className="flex items-center gap-1 bg-surface-container-high p-1 rounded-2xl text-[11px] font-bold">
          {(
            [
              { id: 'all', label: `الكل (${totalSurahs})` },
              { id: 'meccan', label: 'مكية' },
              { id: 'medinan', label: 'مدنية' },
              { id: 'neon', label: `Neon (${customCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1 rounded-xl transition-all ${
                filterType === tab.id
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* تبديل نمط العرض (شبكة / جدول) */}
        <div className="flex items-center gap-1 bg-surface-container-high p-1 rounded-2xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-xl transition-all ${
              viewMode === 'grid'
                ? 'bg-surface-container text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            title="عرض الشبكة (بطاقات)"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-xl transition-all ${
              viewMode === 'table'
                ? 'bg-surface-container text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            title="عرض الجدول المدمج (قائمة)"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AudioToolbar;
