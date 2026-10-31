'use client';

/**
 * رتل - Ratil
 * مكوّن استعراض قائمة الآيات المحفوظة وإدارتها
 * features/bookmarks/components/BookmarksList.tsx
 */

import React from 'react';
import type { BookmarksListProps } from '../types/bookmarks.types';
import { useBookmarks } from '../hooks/useBookmarks';
import BookmarksHeader from './BookmarksHeader';
import BookmarksEmptyState from './BookmarksEmptyState';
import BookmarkItem from './BookmarkItem';

export function BookmarksList({ className = '' }: BookmarksListProps) {
  const { bookmarks, handleDelete, formatDate } = useBookmarks();

  return (
    <div className={`w-full flex flex-col gap-8 max-w-4xl mx-auto px-4 sm:px-6 py-6 ${className}`}>
      {/* ترويسة المحفوظات والخصوصية */}
      <BookmarksHeader />

      {/* المحتوى: فارغ أو قائمة الآيات */}
      {bookmarks.length === 0 ? (
        <BookmarksEmptyState />
      ) : (
        <div className="flex flex-col gap-3">
          {bookmarks.map((b) => (
            <BookmarkItem
              key={`${b.surahId}-${b.ayahNumber}`}
              bookmark={b}
              formattedDate={formatDate(b.timestamp)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default BookmarksList;
