'use client';

/**
 * رتل - Ratil
 * درج التنقل للهواتف المحمولة (Mobile Navigation Drawer)
 * features/navigation/components/MobileNavDrawer.tsx
 */

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ShieldCheck, LogIn, Sun, Moon } from 'lucide-react';
import { PRIMARY_NAV_LINKS } from '../constants/navigation.constants';
import { useAuth } from '@/features/auth';
import { useTheme } from '@/features/theme';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavDrawer({ isOpen, onClose }: MobileNavDrawerProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // قفل التمرير عند فتح القائمة على الهواتف
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
      {/* خلفية معتمة قابلة للنقر */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* لوحة القائمة المنبثقة من اليمين (RTL) */}
      <div className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-surface border-l border-surface-container-high shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        <div className="flex flex-col gap-6">
          {/* ترويسة القائمة */}
          <div className="flex items-center justify-between pb-4 border-b border-surface-container-high">
            <span className="text-lg font-bold text-on-surface">قائمة رَتِّلْ</span>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label="إغلاق القائمة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* روابط التنقل الرئيسية */}
          <nav className="flex flex-col gap-2">
            {PRIMARY_NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href !== '/' && !!pathname?.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* قسم تبديل المظهر بين المشرق والمظلم */}
          <div className="pt-4 border-t border-surface-container-high flex flex-col gap-2">
            <span className="text-xs font-semibold text-on-surface-variant px-2">
              المظهر العام
            </span>
            <button
              onClick={toggleTheme}
              className="flex items-center justify-between px-4 py-3 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-sm font-medium transition-all"
            >
              <div className="flex items-center gap-3">
                {isDark ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-primary" />
                )}
                <span className="text-on-surface">
                  {isDark ? 'التبديل إلى الوضع المشرق (النهاري)' : 'التبديل إلى الوضع المظلم (الليلي)'}
                </span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                {isDark ? 'المشرق ☀️' : 'المظلم 🌙'}
              </span>
            </button>
          </div>

          {/* قسم الحساب وتسجيل الدخول */}
          <div className="pt-2 border-t border-surface-container-high flex flex-col gap-2">
            <span className="text-xs font-semibold text-on-surface-variant px-2">
              الحساب
            </span>
            {!isAuthenticated || !user ? (
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-primary text-on-primary text-sm font-bold shadow-md shadow-primary/20 hover:opacity-95 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول إلى حسابك</span>
              </Link>
            ) : (
              <div className="flex flex-col gap-2 p-3 rounded-2xl bg-surface-container border border-surface-container-high">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary text-on-primary font-bold text-sm flex items-center justify-center">
                    {user.name?.charAt(0) || 'م'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-on-surface">{user.name}</span>
                    <span className="text-xs text-on-surface-variant truncate">{user.email}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-surface-container-high/60 flex items-center justify-between">
                  <Link
                    href="/bookmarks"
                    onClick={onClose}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    المحفوظات
                  </Link>
                  <button
                    onClick={async () => {
                      onClose();
                      await logout();
                    }}
                    className="text-xs text-error font-medium hover:underline"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* تذييل القائمة وبصمة التوثيق */}
        <div className="pt-6 border-t border-surface-container-high flex items-center gap-2 text-xs text-on-surface-variant">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <span>رتل — نصوص موثقة ببصمات SHA-256</span>
        </div>
      </div>
    </div>
  );
}

export default MobileNavDrawer;
