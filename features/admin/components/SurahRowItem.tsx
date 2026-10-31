'use client';

/**
 * رتل - Ratil
 * سطر السورة المفردة في العرض المجدول مع أزرار التحكم السريعة
 * features/admin/components/SurahRowItem.tsx
 */

import React, { useState } from 'react';
import { Play, Pause, Edit3, CheckCircle2, Copy, Check, ExternalLink } from 'lucide-react';

export interface SurahRowItemProps {
  surahNumber: number;
  surahName: string;
  surahType?: string;
  ayahs?: number;
  pad: string;
  audioUrl: string;
  isRegistered?: boolean;
  isActivePreview: boolean;
  onTogglePreview: () => void;
  onOpenEdit: () => void;
}

export function SurahRowItem({
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
}: SurahRowItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(audioUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <tr
      onClick={onTogglePreview}
      className={`border-b border-surface-container-high/60 cursor-pointer transition-colors text-xs select-none ${
        isActivePreview
          ? 'bg-primary/15 hover:bg-primary/20 text-on-surface'
          : 'hover:bg-surface-container-high/40 text-on-surface'
      }`}
    >
      {/* 1. رقم السورة */}
      <td className="py-2.5 px-3 font-mono font-bold text-outline text-[11px] w-12 text-center">
        #{surahNumber}
      </td>

      {/* 2. اسم السورة والنوع والآيات */}
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePreview();
            }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0 ${
              isActivePreview
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-primary hover:text-on-primary'
            }`}
            title={isActivePreview ? 'إيقاف' : 'تشغيل'}
          >
            {isActivePreview ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 translate-x-[-1px]" />}
          </button>
          <div className="flex flex-col">
            <span className="font-bold text-xs text-on-surface flex items-center gap-1.5">
              {surahName}
              {isRegistered && (
                <span title="مسجلة في قاعدة بيانات Neon">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                </span>
              )}
            </span>
            <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
              <span>{surahType}</span>
              <span>•</span>
              <span>{ayahs} آيات</span>
            </span>
          </div>
        </div>
      </td>

      {/* 3. اسم الملف ورابط البث المباشر */}
      <td className="py-2.5 px-3 font-mono text-[11px] text-on-surface-variant hidden sm:table-cell">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface font-semibold text-[10px]">
            {pad}.mp3
          </span>
          <span className="truncate max-w-[200px] text-outline text-[10px]" dir="ltr">
            {audioUrl}
          </span>
        </div>
      </td>

      {/* 4. حالة المصدر */}
      <td className="py-2.5 px-3 text-center hidden md:table-cell">
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isRegistered
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'bg-surface-container-high text-on-surface-variant'
          }`}
        >
          {isRegistered ? 'تخزين دائم (Neon)' : 'بث مباشر (Archive)'}
        </span>
      </td>

      {/* 5. إجراءات التعديل والنسخ */}
      <td className="py-2.5 px-3 text-left w-28" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={handleCopyUrl}
            className="p-1.5 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-primary transition-colors"
            title="نسخ رابط MP3"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <a
            href={audioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-primary transition-colors"
            title="فتح الرابط المباشر في علامة تبويب جديدة"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onOpenEdit}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-[11px] font-bold text-on-surface transition-all border border-surface-container-highest"
            title="تعديل الرابط"
          >
            <Edit3 className="w-3 h-3" />
            <span>تعديل</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

export default SurahRowItem;
