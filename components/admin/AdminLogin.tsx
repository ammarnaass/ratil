'use client';

/**
 * رتل - Ratil
 * شاشة مصادقة المدير عبر ADMIN_SECRET
 * components/admin/AdminLogin.tsx
 */

import React from 'react';
import Link from 'next/link';
import { Lock, KeyRound, AlertCircle, ArrowRight, Shield } from 'lucide-react';

interface AdminLoginProps {
  adminSecret: string;
  setAdminSecret: (val: string) => void;
  authError: string | null;
  isLoading: boolean;
  onLogin: (e: React.FormEvent) => void;
}

export default function AdminLogin({
  adminSecret,
  setAdminSecret,
  authError,
  isLoading,
  onLogin,
}: AdminLoginProps) {
  return (
    <div className="w-full max-w-md mx-auto my-12 p-8 rounded-3xl bg-surface-container border border-surface-container-high shadow-2xl flex flex-col items-center text-center gap-6">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
        <Lock className="w-8 h-8" />
      </div>

      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-bold text-on-surface">لوحة إدارة وحوكمة رتل</h1>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          أدخل المفتاح الإداري السري{' '}
          <span className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
            ADMIN_SECRET
          </span>{' '}
          للتحكم في قاعدة بيانات Neon وفحص مصادر Archive.org
        </p>
      </div>

      {authError && (
        <div className="w-full p-3 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2 text-right">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      <form onSubmit={onLogin} className="w-full flex flex-col gap-4">
        <div className="relative">
          <KeyRound className="w-4 h-4 absolute right-3.5 top-3.5 text-on-surface-variant" />
          <input
            type="password"
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            placeholder="أدخل ADMIN_SECRET..."
            className="w-full py-3 pr-10 pl-4 rounded-xl bg-surface-container-high border border-surface-container-highest text-on-surface text-sm focus:outline-none focus:border-primary transition-all font-mono"
            required
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-95 transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading ? 'جاري التحقق...' : 'فتح لوحة التحكم'}
        </button>
      </form>

      <div className="pt-2 border-t border-surface-container-high/60 w-full flex items-center justify-between text-xs text-on-surface-variant">
        <Link
          href="/"
          className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة للمصحف</span>
        </Link>
        <div className="flex items-center gap-1 text-[11px] text-outline">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span>حوكمة مشفرة (Bearer Token)</span>
        </div>
      </div>
    </div>
  );
}
