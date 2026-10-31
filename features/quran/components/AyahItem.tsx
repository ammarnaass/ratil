'use client';

/**
 * رتل - Ratil
 * مكوّن عرض الآية القرآنية ورقمها وزر الحفظ
 * features/quran/components/AyahItem.tsx
 */

import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import type { AyahItemProps } from '../types/quran.types';
import { toArabicDigits } from '@/lib/normalize';

export function AyahItem({
  verse,
  isActive,
  isBookmarked,
  onAyahClick,
  onToggleBookmark,
}: AyahItemProps) {
  return (
    <span
      id={`ayah-${verse.number}`}
      onClick={() => onAyahClick?.(verse.number)}
      className={`inline cursor-pointer rounded-xl px-1.5 py-1 transition-all group ${
        isActive
          ? 'bg-primary/20 text-primary-focus ring-1 ring-primary/40 font-semibold'
          : 'hover:bg-surface-container-high'
      }`}
      title={`الآية ${verse.number} (اضغط للاستماع)`}
    >
      <span>{verse.text}</span>
      <span className="inline-flex items-center mx-1.5 align-middle select-none">
        <span
          className={`ayah-number-badge text-xs font-bold tabular-nums ${
            isActive ? 'bg-primary text-on-primary border-primary' : ''
          }`}
        >
          {toArabicDigits(verse.number)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(verse.number);
          }}
          className={`opacity-0 group-hover:opacity-100 p-1 rounded-full text-on-surface-variant hover:text-primary transition-opacity ${
            isBookmarked ? 'opacity-100 text-primary' : ''
          }`}
          title={isBookmarked ? 'إزالة من المحفوظات' : 'حفظ الآية'}
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-3.5 h-3.5 fill-primary text-primary" />
          ) : (
            <Bookmark className="w-3.5 h-3.5" />
          )}
        </button>
      </span>
    </span>
  );
}

export default AyahItem;
