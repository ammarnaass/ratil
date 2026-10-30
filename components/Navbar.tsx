'use client';

/**
 * رتل - Ratil
 * شريط التنقل العلوي (Navbar)
 * components/Navbar.tsx
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Volume2, BookOpen, Users, Bookmark, Search, ShieldCheck } from 'lucide-react';
import Logo from '@/components/Logo';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'الرئيسية', icon: Volume2 },
    { href: '/surah/1', label: 'المصحف', icon: BookOpen },
    { href: '/reciters', label: 'القرّاء', icon: Users },
    { href: '/bookmarks', label: 'المحفوظات', icon: Bookmark },
  ];

  return (
    <header className="sticky top-0 inset-x-0 z-40 bg-surface/90 backdrop-blur-md border-b border-surface-container-high transition-all">
      <div className="h-16 md:h-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* الشعار */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/" className="group focus:outline-none">
            <Logo size={42} showText={true} />
          </Link>

          {/* شارة توثيق البصمة */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-xs text-on-surface-variant font-medium border border-surface-container-high">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>نص وبصمات موثقة</span>
          </div>
        </div>

        {/* روابط التنقل الرئيسية */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-container/60 p-1.5 rounded-2xl border border-surface-container-high">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && !!pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* أزرار الإجراءات السريعة */}
        <div className="flex items-center gap-2">
          <Link
            href="/#search"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface text-sm transition-all border border-surface-container-high"
          >
            <Search className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">بحث في السور...</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
