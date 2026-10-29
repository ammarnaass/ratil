'use client';

/**
 * رتل - Ratil
 * صفحة الملف الشخصي والمزامنة السحابية (Profile Page)
 * app/profile/page.tsx
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Shield,
  Bookmark,
  RefreshCw,
  LogOut,
  Play,
  ArrowRight,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { getBookmarks, getLastPlayed } from '@/lib/storage';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, syncWithCloud } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [localBookmarksCount, setLocalBookmarksCount] = useState(0);
  const [lastPlayed, setLastPlayed] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    setLocalBookmarksCount(getBookmarks().length);
    setLastPlayed(getLastPlayed());
  }, [isLoading, isAuthenticated, router]);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    await syncWithCloud();
    setLocalBookmarksCount(getBookmarks().length);
    setIsSyncing(false);
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 4000);
  };

  if (isLoading || !user) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const memberDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'حديثاً';

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between border-b border-surface-container-high pb-4">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
          >
            <ArrowRight className="w-4 h-4" />
            <span>الرئيسية</span>
          </Link>
          <span className="text-outline text-xs">/</span>
          <span className="text-xs font-semibold text-on-surface">الملف الشخصي</span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs text-error hover:bg-error/10 py-1.5 px-3 rounded-xl transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>خروج</span>
        </button>
      </div>

      {/* بطاقة معلومات الحساب */}
      <div className="p-6 rounded-3xl bg-surface-container border border-surface-container-high flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-xl">
        <div className="w-20 h-20 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center text-3xl font-extrabold shadow-inner shrink-0">
          {user.name.slice(0, 2)}
        </div>

        <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-right gap-1.5">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <h1 className="text-2xl font-bold text-on-surface">{user.name}</h1>
            {user.role === 'admin' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                <Shield className="w-3.5 h-3.5" />
                مشرف عام
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-on-surface-variant" dir="ltr">
            <Mail className="w-3.5 h-3.5 text-outline" />
            <span>{user.email}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-outline mt-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>عضو منذ: {memberDate}</span>
          </div>
        </div>
      </div>

      {/* بطاقة المزامنة السحابية */}
      <div className="p-6 rounded-3xl bg-surface-container border border-surface-container-high flex flex-col gap-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface">المزامنة مع سحابة Neon</h2>
              <p className="text-xs text-on-surface-variant">مزامنة تلقائية للآيات المفضلة وآخر موضع تلاوة</p>
            </div>
          </div>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 py-2 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة الآن'}</span>
          </button>
        </div>

        {syncSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>تمت مزامنة بياناتك السحابية بنجاح!</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <Link
            href="/bookmarks"
            className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high hover:border-primary/40 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-5 h-5 text-secondary" />
              <div>
                <span className="block text-xs text-on-surface-variant">المحفوظات</span>
                <span className="text-base font-bold text-on-surface">{localBookmarksCount} آية</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-outline" />
          </Link>

          {lastPlayed ? (
            <Link
              href={`/surah/${lastPlayed.surahId}`}
              className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high hover:border-primary/40 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Play className="w-5 h-5 text-primary" />
                <div>
                  <span className="block text-xs text-on-surface-variant">آخر استماع</span>
                  <span className="text-base font-bold text-on-surface">سورة {lastPlayed.surahName || lastPlayed.surahId}</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-outline" />
            </Link>
          ) : (
            <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high flex items-center gap-3 text-xs text-on-surface-variant">
              <Play className="w-5 h-5 text-outline" />
              <span>لم تسجل أي تلاوة بعد</span>
            </div>
          )}
        </div>
      </div>

      {/* لوحة التحكم إذا كان مشرفاً */}
      {user.role === 'admin' && (
        <div className="p-6 rounded-3xl bg-surface-container-high border border-primary/30 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-sm font-bold text-on-surface">صلاحيات الإشراف والحوكمة</h2>
              <p className="text-xs text-on-surface-variant">إدارة القرّاء والمكتبة الصوتية والتدقيق العلمي</p>
            </div>
          </div>
          <Link
            href="/admin"
            className="py-2 px-4 rounded-xl bg-surface-container-highest hover:bg-primary hover:text-on-primary text-primary text-xs font-bold transition-colors border border-primary/30"
          >
            دخول لوحة الإدارة
          </Link>
        </div>
      )}
    </div>
  );
}
