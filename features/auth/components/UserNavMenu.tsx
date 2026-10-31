'use client';

/**
 * رتل - Ratil
 * قائمة المستخدم وشارة تسجيل الدخول في شريط التنقل (UserNavMenu)
 * features/auth/components/UserNavMenu.tsx
 */

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { LogIn, LogOut, Bookmark, ChevronDown, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function UserNavMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = Boolean(user && (user.role === 'admin' || user.email === 'admin@dante.com'));

  // إغلاق القائمة المنسدلة عند النقر بالخارج
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // إذا لم يكن المستخدم مسجلاً، يظهر زر "تسجيل الدخول" الصريح والبارز دائماً
  if (!isAuthenticated || !user) {
    return (
      <Link
        href="/login"
        id="navbar-login-button"
        className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-primary text-on-primary font-bold text-xs sm:text-sm hover:opacity-95 transition-all shadow-md shadow-primary/20 shrink-0 whitespace-nowrap active:scale-95 border border-primary/20"
        title="تسجيل الدخول إلى رتل"
      >
        <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
        <span>تسجيل الدخول</span>
      </Link>
    );
  }

  // حرف أول من اسم المستخدم
  const initial = user.name ? user.name.trim().charAt(0) : 'م';

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        id="navbar-user-button"
        className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high transition-all text-on-surface focus:outline-none"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        title={`حساب: ${user.name}`}
      >
        <div className={`w-7 h-7 rounded-lg ${isAdmin ? 'bg-primary text-on-primary ring-2 ring-primary/40' : 'bg-primary text-on-primary'} font-bold text-xs flex items-center justify-center shadow-sm`}>
          {initial}
        </div>
        <span className="hidden sm:inline text-xs font-semibold text-on-surface max-w-[110px] truncate">
          {user.name}
        </span>
        {isAdmin && (
          <span className="hidden md:inline-flex text-[10px] px-1.5 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/25 font-bold">
            مدير
          </span>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-on-surface-variant transition-transform duration-200 ${
            dropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {dropdownOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-surface border border-surface-container-high rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* ترويسة الحساب */}
          <div className="px-4 py-2.5 border-b border-surface-container-high bg-surface-container/40">
            <div className="flex items-center justify-between gap-1">
              <p className="text-xs font-bold text-on-surface truncate">{user.name}</p>
              {isAdmin && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/25 font-bold">
                  مدير النظام
                </span>
              )}
            </div>
            <p className="text-[11px] text-on-surface-variant truncate mt-0.5">{user.email}</p>
          </div>

          {/* روابط سريعة */}
          <div className="py-1">
            <Link
              href="/bookmarks"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs text-on-surface hover:bg-surface-container hover:text-primary transition-colors"
            >
              <Bookmark className="w-4 h-4 text-primary" />
              <span>الآيات المحفوظة</span>
            </Link>

            {isAdmin ? (
              <Link
                href="/admin"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors bg-primary/5"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>لوحة الإدارة والتحقق</span>
                </div>
                <span className="text-[10px] bg-primary text-on-primary px-1.5 py-0.5 rounded font-bold">
                  تحكم
                </span>
              </Link>
            ) : (
              <Link
                href="/admin"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-on-surface hover:bg-surface-container hover:text-primary transition-colors"
              >
                <ChevronDown className="w-4 h-4 text-primary -rotate-90" />
                <span>لوحة الإدارة والتحقق</span>
              </Link>
            )}
          </div>

          {/* زر تسجيل الخروج */}
          <div className="pt-1 border-t border-surface-container-high">
            <button
              onClick={async () => {
                setDropdownOpen(false);
                await logout();
              }}
              id="navbar-logout-button"
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-error hover:bg-error/10 transition-colors text-right font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserNavMenu;
