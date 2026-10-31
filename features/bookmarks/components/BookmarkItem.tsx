'use client';

/**
 * رتل - Ratil
 * بطاقة الآية المحفوظة ورابط الانتقال إليها مباشرة
 * features/bookmarks/components/BookmarkItem.tsx
 */

import React from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Trash2 } from 'lucide-react';
import type { BookmarkItemProps } from '../types/bookmarks.types';
import { toArabicDigits } from '@/lib/normalize';

export function BookmarkItem({
  bookmark,
  formattedDate,
  onDelete,
}: BookmarkItemProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container border border-surface-container-high hover:border-primary/30 transition-all shadow-sm group">
      <div className="flex items-center gap-4">
        <span className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary font-bold text-sm shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors">
          {bookmark.surahId}
        </span>

        <div className="flex flex-col">
          <span className="text-base font-bold text-on-surface group-hover:text-primary transition-colors">
            سورة {bookmark.surahName} — الآية {toArabicDigits(bookmark.ayahNumber)}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-0.5">
            <Clock className="w-3.5 h-3.5 text-outline" />
            <span>تم الحفظ في {formattedDate}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/surah/${bookmark.surahId}#ayah-${bookmark.ayahNumber}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-primary hover:text-on-primary text-xs font-medium text-on-surface transition-all shadow-sm"
        >
          <BookOpen className="w-4 h-4" />
          <span>فتح الآية</span>
        </Link>

        <button
          onClick={() => onDelete(bookmark.surahId, bookmark.ayahNumber)}
          className="p-2 rounded-xl text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
          title="حذف الإشارة"
          aria-label="حذف الإشارة"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default BookmarkItem;
