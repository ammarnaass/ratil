'use client';

/**
 * رتل - Ratil
 * شريط التنقل العلوي المثبت (Top Navbar)
 * features/navigation/components/Navbar.tsx
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ShieldCheck, Menu } from 'lucide-react';
import { UserNavMenu } from '@/features/auth';
import { ThemeToggle } from '@/features/theme';
import Logo from './Logo';
import NavLinks from './NavLinks';
import MobileNavDrawer from './MobileNavDrawer';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-b border-surface-container-high transition-colors">
        <div className="h-16 md:h-20 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          {/* الشعار وتوثيق البصمة */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* زر فتح القائمة على الهواتف */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-surface-container-high md:hidden transition-colors"
              aria-label="فتح القائمة الرئيسية"
              title="القائمة"
            >
              <Menu className="w-4 h-4 text-primary" />
            </button>

            <Link href="/" className="group focus:outline-none">
              <Logo size={38} showText={true} />
            </Link>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container/80 text-xs text-on-surface-variant font-medium border border-surface-container-high shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>نص وبصمات موثقة</span>
            </div>
          </div>

          {/* روابط التنقل المعتمدة (وسط الشاشة) */}
          <NavLinks />

          {/* أزرار الإجراءات السريعة والمظهر والحساب (دائماً ظاهرة بـ shrink-0) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link
              href="/#search"
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface text-xs sm:text-sm transition-all border border-surface-container-high"
              title="البحث في السور"
            >
              <Search className="w-4 h-4 text-primary shrink-0" />
              <span className="hidden md:inline">بحث في السور...</span>
            </Link>

            {/* زر التبديل بين المشرق والمظلم */}
            <ThemeToggle showLabel={true} />

            {/* زر تسجيل الدخول أو قائمة المستخدم */}
            <UserNavMenu />
          </div>
        </div>
      </header>

      {/* درج التنقل المخصص للهواتف المحمولة */}
      <MobileNavDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}

export default Navbar;
