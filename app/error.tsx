'use client';

/**
 * رتل - Ratil
 * واجهة معالجة الأخطاء الشاملة (Next.js Global Error Boundary)
 * app/error.tsx
 */

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Captured by Root ErrorBoundary:', error);
  }, [error]);

  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="p-8 rounded-3xl bg-surface-container border border-surface-container-high max-w-md w-full flex flex-col items-center gap-5 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-error/10 text-error flex items-center justify-center border border-error/20">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold text-on-surface">حدث خطأ غير متوقع</h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            نعتذر عن هذا الخلل المؤقت. يمكنك محاولة إعادة تحميل الصفحة أو العودة للرئيسية.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة المحاولة</span>
          </button>

          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-semibold text-xs hover:bg-surface-container-highest transition-all border border-surface-container-highest"
          >
            <Home className="w-4 h-4" />
            <span>الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
