'use client';

/**
 * رتل - Ratil
 * خطاف مخصص لإدارة العلامات المرجعية والآيات المحفوظة في التخزين المحلي
 * features/bookmarks/hooks/useBookmarks.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { getBookmarks, removeBookmark } from '@/lib/storage';
import type { BookmarkItemData } from '../types/bookmarks.types';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkItemData[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    setBookmarks(getBookmarks());
    setIsLoaded(true);
  }, []);

  const handleDelete = useCallback((surahId: number, ayahNumber: number) => {
    removeBookmark(surahId, ayahNumber);
    setBookmarks((prev) =>
      prev.filter((b) => !(b.surahId === surahId && b.ayahNumber === ayahNumber))
    );
  }, []);

  const formatDate = useCallback((ts: number) => {
    try {
      return new Date(ts).toLocaleDateString('ar-SA', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  }, []);

  return {
    bookmarks,
    isLoaded,
    handleDelete,
    formatDate,
  };
}
