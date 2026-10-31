'use client';

/**
 * رتل - Ratil
 * شاشة مصادقة المدير عبر حساب المدير أو ADMIN_SECRET
 * features/admin/components/AdminLogin.tsx
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, KeyRound, AlertCircle, ArrowRight, Shield, Mail } from 'lucide-react';
import { useAuth } from '@/features/auth';

export interface AdminLoginProps {
  adminSecret: string;
  setAdminSecret: (val: string) => void;
  authError: string | null;
  isLoading: boolean;
  onLogin: (e: React.FormEvent) => void;
  isUserAdmin?: boolean;
  currentUser?: { name?: string; email?: string } | null;
  onAdminDirectEnter?: () => void;
}

export function AdminLogin({
  adminSecret,
  setAdminSecret,
  authError,
  isLoading,
  onLogin,
  isUserAdmin,
  currentUser,
  onAdminDirectEnter,
}: AdminLoginProps) {
  const { login } = useAuth();
  const [loginMode, setLoginMode] = useState<'account' | 'secret'>('account');
  const [email, setEmail] = useState('admin@dante.com');
  const [password, setPassword] = useState('');
  const [accountError, setAccountError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // إذا كان المستخدم مسجلاً بالفعل كمدير في النظام
  if (isUserAdmin && currentUser) {
    return (
      <div className="w-full max-w-md mx-auto my-12 p-8 rounded-3xl bg-surface-container border border-surface-container-high shadow-2xl flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
          <Shield className="w-8 h-8" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-bold text-on-surface">أهلاً بك يا مدير النظام</h1>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            أنت مسجّل الدخول بحساب الإدارة المعتمد{' '}
            <span className="font-mono text-primary font-bold">{currentUser.email}</span>
          </p>
        </div>
        <button
          onClick={onAdminDirectEnter}
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-95 transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading ? 'جاري فتح اللوحة...' : 'الدخول المباشر إلى لوحة التحكم'}
        </button>
      </div>
    );
  }

  const handleAccountLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError(null);
    setIsSubmitting(true);
    try {
      const res = await login({ email, password });
      if (!res.success) {
        setAccountError(res.error || 'فشل تسجيل الدخول كمدير');
      } else {
        onAdminDirectEnter?.();
      }
    } catch (err: any) {
      setAccountError(err.message || 'خطأ أثناء الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-12 p-8 rounded-3xl bg-surface-container border border-surface-container-high shadow-2xl flex flex-col items-center text-center gap-6">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
        <Lock className="w-8 h-8" />
      </div>

      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-bold text-on-surface">لوحة إدارة وحوكمة رتل</h1>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          قم بتسجيل الدخول بحساب مدير النظام للتحكم في قاعدة البيانات وفحص تلاوات المصحف
        </p>
      </div>

      {/* تبديل طريقة الدخول */}
      <div className="w-full grid grid-cols-2 p-1 rounded-xl bg-surface-container-lowest border border-surface-container-high text-xs font-semibold">
        <button
          type="button"
          onClick={() => setLoginMode('account')}
          className={`py-2 rounded-lg transition-all ${
            loginMode === 'account'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          حساب المدير
        </button>
        <button
          type="button"
          onClick={() => setLoginMode('secret')}
          className={`py-2 rounded-lg transition-all ${
            loginMode === 'secret'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          مفتاح ADMIN_SECRET
        </button>
      </div>

      {(authError || accountError) && (
        <div className="w-full p-3 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2 text-right">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{accountError || authError}</span>
        </div>
      )}

      {loginMode === 'account' ? (
        <form onSubmit={handleAccountLogin} className="w-full flex flex-col gap-3.5 text-right">
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-on-surface-variant" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dante.com"
                className="w-full py-2.5 px-3.5 pl-10 rounded-xl bg-surface-container-high border border-surface-container-highest text-on-surface text-sm focus:outline-none focus:border-primary transition-all ltr text-left"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">كلمة المرور</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-on-surface-variant" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full py-2.5 px-3.5 pl-10 rounded-xl bg-surface-container-high border border-surface-container-highest text-on-surface text-sm focus:outline-none focus:border-primary transition-all ltr text-left"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-95 transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? 'جاري التحقق...' : 'تسجيل الدخول كمدير'}
          </button>
        </form>
      ) : (
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
      )}

      <div className="pt-2 border-t border-surface-container-high/60 w-full flex items-center justify-between text-xs text-on-surface-variant">
        <Link href="/" className="hover:text-primary transition-colors inline-flex items-center gap-1.5">
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة للمصحف</span>
        </Link>
        <div className="flex items-center gap-1 text-[11px] text-outline">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span>حوكمة مشفرة وآمنة</span>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
