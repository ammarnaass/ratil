'use client';

/**
 * رتل - Ratil
 * قائمة المستخدم وشريط التوثيق في الترويسة (UserNavMenu)
 * features/auth/components/UserNavMenu.tsx
 */

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  LogIn,
  LogOut,
  Shield,
  Bookmark,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AUTH_ROUTES } from '../constants/auth.constants';

export function UserNavMenu() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, syncWithCloud } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncWithCloud();
    setIsSyncing(false);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    router.push(AUTH_ROUTES.HOME);
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-surface-container animate-pulse border border-surface-container-high" />
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Link
        href={AUTH_ROUTES.LOGIN}
        className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface hover:text-primary transition-all border border-surface-container-high shadow-sm"
      >
        <LogIn className="w-3.5 h-3.5 text-primary" />
        <span>دخول</span>
      </Link>
    );
  }

  const initials = user.name.slice(0, 2);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high transition-colors focus:outline-none"
      >
        <div className="w-7 h-7 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs">
          {initials}
        </div>
        <span className="text-xs font-medium text-on-surface max-w-[90px] truncate hidden sm:inline">
          {user.name}
        </span>
        <ChevronDown className="w-3 h-3 text-outline" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-surface-container-high border border-surface-container-highest shadow-2xl p-2 z-50 flex flex-col gap-1 text-xs">
          <div className="p-2.5 border-b border-surface-container-highest flex flex-col gap-0.5">
            <span className="font-bold text-on-surface text-sm truncate">{user.name}</span>
            <span className="text-[11px] text-on-surface-variant truncate" dir="ltr">
              {user.email}
            </span>
            {user.role === 'admin' && (
              <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-[10px] w-fit">
                <Shield className="w-3 h-3" />
                مشرف علمي
              </span>
            )}
          </div>

          <Link
            href={AUTH_ROUTES.PROFILE}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface-container-highest text-on-surface transition-colors"
          >
            <UserIcon className="w-4 h-4 text-primary" />
            <span>الملف الشخصي والمزامنة</span>
          </Link>

          <Link
            href="/bookmarks"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface-container-highest text-on-surface transition-colors"
          >
            <Bookmark className="w-4 h-4 text-secondary" />
            <span>المحفوظات السحابية</span>
          </Link>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-surface-container-highest text-on-surface transition-colors text-right disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-primary ${isSyncing ? 'animate-spin' : ''}`} />
            <span>مزامنة المحفوظات الآن</span>
          </button>

          {user.role === 'admin' && (
            <Link
              href={AUTH_ROUTES.ADMIN}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface-container-highest text-primary font-medium transition-colors border-t border-surface-container-highest/60"
            >
              <Shield className="w-4 h-4" />
              <span>لوحة الإشراف والحوكمة</span>
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-error/10 text-error transition-colors text-right border-t border-surface-container-highest/60 mt-1"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      )}
    </div>
  );
}
