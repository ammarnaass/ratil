/**
 * رتل - Ratil
 * أنواع ومعرّفات ميزة المحفوظات والإشارات المرجعية
 * features/bookmarks/types/bookmarks.types.ts
 */

import type { Bookmark as StorageBookmark } from '@/lib/types';

export type BookmarkItemData = StorageBookmark;

export interface BookmarkItemProps {
  bookmark: BookmarkItemData;
  formattedDate: string;
  onDelete: (surahId: number, ayahNumber: number) => void;
}

export interface BookmarksListProps {
  className?: string;
}
