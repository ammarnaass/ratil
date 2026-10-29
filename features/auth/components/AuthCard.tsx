'use client';

/**
 * رتل - Ratil
 * بطاقة التوثيق الموحدة (AuthCard)
 * features/auth/components/AuthCard.tsx
 */

import React from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-surface-container rounded-3xl border border-surface-container-high shadow-2xl flex flex-col gap-6">
      <div className="flex flex-col items-center text-center gap-2">
        <Link
          href="/"
          className="group focus:outline-none"
        >
          <Logo size={60} />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-2">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-xs">
          {subtitle}
        </p>
      </div>

      <div className="w-full">{children}</div>

      {footer && (
        <div className="pt-4 border-t border-surface-container-high/60 text-center text-xs text-on-surface-variant">
          {footer}
        </div>
      )}
    </div>
  );
}
