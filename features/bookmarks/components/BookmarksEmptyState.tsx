import React from 'react';
import Link from 'next/link';
import { Bookmark } from 'lucide-react';

/**
 * رتل - Ratil
 * مكوّن الحالة الفارغة عند عدم وجود محفوظات
 * features/bookmarks/components/BookmarksEmptyState.tsx
 */
export function BookmarksEmptyState() {
  return (
    <div className="p-12 text-center rounded-3xl bg-surface-container border border-surface-container-high flex flex-col items-center gap-3 shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-outline/40">
        <Bookmark className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-on-surface">لا توجد آيات محفوظة بعد</h3>
      <p className="text-xs text-on-surface-variant max-w-md leading-relaxed">
        يمكنك حفظ أي آية أثناء القراءة بالضغط على أيقونة الإشارة المرجعية بجانب رقم الآية في صفحة السورة.
      </p>
      <Link
        href="/surah/1"
        className="mt-3 px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-focus transition-all shadow-md active:scale-95"
      >
        تصفح المصحف الشريف
      </Link>
    </div>
  );
}

export default BookmarksEmptyState;
