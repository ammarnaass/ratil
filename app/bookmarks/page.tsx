'use client';

/**
 * رتل - Ratil
 * صفحة المحفوظات والآيات المفضلة (Bookmarks)
 * app/bookmarks/page.tsx
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, ArrowRight, Trash2, BookOpen, Clock, RefreshCw, LogIn, CheckCircle2 } from 'lucide-react';
import { getBookmarks, removeBookmark } from '@/lib/storage';
import { useAuth } from '@/features/auth';
import type { Bookmark as BookmarkItem } from '@/lib/types';
import { toArabicDigits } from '@/lib/normalize';

export default function BookmarksPage() {
  const { user, isAuthenticated, syncWithCloud } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncDone(false);
    await syncWithCloud();
    setBookmarks(getBookmarks());
    setIsSyncing(false);
    setSyncDone(true);
    setTimeout(() => setSyncDone(false), 3000);
  };

  const handleDelete = (surahId: number, ayahNumber: number) => {
    removeBookmark(surahId, ayahNumber);
    setBookmarks((prev) =>
      prev.filter((b) => !(b.surahId === surahId && b.ayahNumber === ayahNumber))
    );
  };

  const formatDate = (ts: number) => {
    try {
      return new Date(ts).toLocaleDateString('ar-SA', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 max-w-4xl mx-auto px-4 sm:px-6 py-6">
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
            <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary border border-surface-container-high">
              <Bookmark className="w-6 h-6 fill-primary" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
                الآيات المحفوظة
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                {isAuthenticated
                  ? `مزامنة سحابية نشطة لحساب: ${user?.name}`
                  : 'محفوظاتك مخزنة محلياً. سجّل دخولك لمزامنتها مع السحابة.'}
              </p>
            </div>
          </div>

          <div>
            {isAuthenticated ? (
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-2 py-2 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-primary border border-surface-container-high transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{syncDone ? 'تمت المزامنة بنجاح' : isSyncing ? 'جاري المزامنة...' : 'مزامنة مع السحابة'}</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-all shadow-md shadow-primary/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>تسجيل الدخول للمزامنة</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-surface-container border border-surface-container-high flex flex-col items-center gap-3">
          <Bookmark className="w-12 h-12 text-outline/40" />
          <h3 className="text-lg font-bold text-on-surface">لا توجد آيات محفوظة بعد</h3>
          <p className="text-xs text-on-surface-variant max-w-md">
            يمكنك حفظ أي آية أثناء القراءة بالضغط على أيقونة الإشارة المرجعية بجانب رقم الآية.
          </p>
          <Link
            href="/surah/1"
            className="mt-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-focus transition-colors"
          >
            تصفح المصحف الشريف
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bookmarks.map((b) => (
            <div
              key={`${b.surahId}-${b.ayahNumber}`}
              className="flex items-center justify-between p-4 rounded-2xl bg-surface-container border border-surface-container-high hover:border-primary/30 transition-all shadow-sm"
            >
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary font-bold text-sm">
                  {b.surahId}
                </span>

                <div className="flex flex-col">
                  <span className="text-base font-bold text-on-surface">
                    سورة {b.surahName} — الآية {toArabicDigits(b.ayahNumber)}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>تم الحفظ في {formatDate(b.timestamp)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/surah/${b.surahId}#ayah-${b.ayahNumber}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-primary hover:text-on-primary text-xs font-medium text-on-surface transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>فتح الآية</span>
                </Link>

                <button
                  onClick={() => handleDelete(b.surahId, b.ayahNumber)}
                  className="p-2 rounded-xl text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                  title="حذف الإشارة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
