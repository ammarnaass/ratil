'use client';

/**
 * رتل - Ratil
 * صفحة المحفوظات والآيات المفضلة (Next.js 14 App Router)
 * معمارية معيارية موجهة بالميزات (Feature-Driven Architecture)
 * app/bookmarks/page.tsx
 */

import React from 'react';
import { BookmarksList } from '@/features/bookmarks';

export default function BookmarksPage() {
  return <BookmarksList />;
}
