'use client';

/**
 * رتل - Ratil
 * روابط التنقل الرئيسية مع تمييز الصفحة الحالية
 * features/navigation/components/NavLinks.tsx
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PRIMARY_NAV_LINKS } from '../constants/navigation.constants';

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-1 bg-surface-container/60 p-1.5 rounded-2xl border border-surface-container-high">
      {PRIMARY_NAV_LINKS.map((link) => {
        const Icon = link.icon;
        const isActive =
          pathname === link.href ||
          (link.href !== '/' && !!pathname?.startsWith(link.href));

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
  );
}

export default NavLinks;
