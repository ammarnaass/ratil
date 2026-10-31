import React from 'react';
import Link from 'next/link';
import { Bookmark, ArrowRight, ShieldCheck } from 'lucide-react';

/**
 * رتل - Ratil
 * ترويسة صفحة المحفوظات وشارة الخصوصية المحلية
 * features/bookmarks/components/BookmarksHeader.tsx
 */
export function BookmarksHeader() {
  return (
    <div className="flex flex-col gap-2">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors w-fit"
      >
        <ArrowRight className="w-4 h-4" />
        <span>العودة للرئيسية</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary border border-surface-container-high shadow-sm">
            <Bookmark className="w-6 h-6 fill-primary" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
              الآيات المحفوظة
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              محفوظاتك مخزنة محلياً في جهازك بخصوصية تامة ودون تتبع.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container text-xs text-on-surface-variant border border-surface-container-high">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>حفظ محلي آمن في المتصفح</span>
        </div>
      </div>
    </div>
  );
}

export default BookmarksHeader;
