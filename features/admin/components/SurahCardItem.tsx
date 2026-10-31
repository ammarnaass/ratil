'use client';

/**
 * رتل - Ratil
 * بطاقة السورة المفردة في شبكة الصوتيات مع تصميم إسلامي متناسق الأبعاد والمسافات
 * features/admin/components/SurahCardItem.tsx
 */

import React from 'react';
import { Play, Pause, Edit3, CheckCircle2 } from 'lucide-react';

export interface SurahCardItemProps {
  surahNumber: number;
  surahName: string;
  surahType?: string;
  ayahs?: number;
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
  surahType = 'مكية',
  ayahs = 0,
  pad,
  audioUrl,
  isRegistered = true,
  isActivePreview,
  onTogglePreview,
  onOpenEdit,
}: SurahCardItemProps) {
  return (
    <div
      onClick={onTogglePreview}
      className={`group relative p-3 sm:p-3.5 rounded-2xl border cursor-pointer select-none transition-all duration-200 flex flex-col justify-between gap-2.5 min-h-[118px] ${
        isActivePreview
          ? 'bg-primary/10 border-primary ring-2 ring-primary/30 shadow-md shadow-primary/10'
          : 'bg-surface-container hover:bg-surface-container-high border-surface-container-high/80 hover:border-primary/40 hover:shadow-xs'
      }`}
    >
      {/* 1. السطر العلوي: الرقم والنوع وبصمة Neon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-surface-container-high text-outline font-bold">
            #{surahNumber}
          </span>
          <span className="text-[10px] text-on-surface-variant font-medium">
            {surahType}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isRegistered && (
            <span title="مسجلة في قاعدة بيانات Neon">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary/80 shrink-0" />
            </span>
          )}
          {ayahs > 0 && (
            <span className="text-[9px] text-outline font-mono">
              {ayahs} آية
            </span>
          )}
        </div>
      </div>

      {/* 2. اسم السورة بالخط الأنيق ومؤشر الصوت عند التشغيل */}
      <div className="flex items-center justify-between gap-2 py-0.5">
        <h3 className="font-bold text-sm text-on-surface tracking-wide group-hover:text-primary transition-colors truncate">
          {surahName}
        </h3>

        {/* مؤشر النبض الصوتي إذا كانت السورة قيد الاستماع */}
        {isActivePreview && (
          <div className="flex items-end gap-0.5 h-4 shrink-0 px-1.5 py-0.5 rounded bg-primary/20 text-primary">
            <span className="w-1 bg-primary rounded-full animate-bounce [animation-delay:0ms] h-3" />
            <span className="w-1 bg-primary rounded-full animate-bounce [animation-delay:150ms] h-2" />
            <span className="w-1 bg-primary rounded-full animate-bounce [animation-delay:300ms] h-4" />
          </div>
        )}
      </div>

      {/* 3. السطر السفلي: اسم الملف وأزرار الاستماع والتعديل السريع مع محاذاة سفلية ثابتة */}
      <div className="flex items-center justify-between pt-1.5 border-t border-surface-container-high/50 text-[11px] mt-auto">
        <span
          className="font-mono text-[10px] text-outline group-hover:text-on-surface-variant transition-colors truncate max-w-[70px] sm:max-w-[90px]"
          title={audioUrl}
        >
          {pad}.mp3
        </span>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onTogglePreview}
            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
              isActivePreview
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface-variant'
            }`}
            title={isActivePreview ? 'إيقاف المعاينة' : 'تشغيل المعاينة المباشرة'}
          >
            {isActivePreview ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 translate-x-[-1px]" />}
          </button>

          <button
            type="button"
            onClick={onOpenEdit}
            className="w-7 h-7 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-primary flex items-center justify-center transition-all border border-surface-container-highest"
            title="تعديل رابط السورة"
          >
            <Edit3 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default SurahCardItem;
