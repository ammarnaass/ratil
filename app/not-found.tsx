import React from 'react';
import Link from 'next/link';
import { Compass, Home, BookOpen } from 'lucide-react';

/**
 * رتل - Ratil
 * واجهة الصفحة غير الموجودة (Next.js Global Not Found)
 * app/not-found.tsx
 */

export default function NotFoundPage() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="p-8 rounded-3xl bg-surface-container border border-surface-container-high max-w-md w-full flex flex-col items-center gap-5 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-secondary-container/30 text-secondary flex items-center justify-center border border-secondary/20">
          <Compass className="w-7 h-7" />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-4xl font-extrabold text-primary font-mono tracking-wider">404</span>
          <h2 className="text-xl font-bold text-on-surface">الصفحة غير موجودة</h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            لم نتمكن من العثور على المسار المطلوب. ربما تم نقله أو تغييره.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full pt-2">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 transition-all shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>الرئيسية</span>
          </Link>

          <Link
            href="/reciters"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-semibold text-xs hover:bg-surface-container-highest transition-all border border-surface-container-highest"
          >
            <BookOpen className="w-4 h-4" />
            <span>قائمة القرّاء</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
