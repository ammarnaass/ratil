'use client';

/**
 * رتل - Ratil
 * صفحة تسجيل الدخول (Login Page)
 * app/login/page.tsx
 */

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Logo } from '@/features/navigation';
import { LoginForm, useAuth } from '@/features/auth';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // إذا كان المستخدم مسجلاً بالفعل، يتم توجيهه إلى الرئيسية
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="w-full min-h-[calc(100vh-160px)] flex flex-col justify-center items-center px-4 py-10">
      {/* زر العودة */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </Link>
        <span className="text-xs text-on-surface-variant flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>تجربة قرآنية موثوقة</span>
        </span>
      </div>

      {/* بطاقة تسجيل الدخول */}
      <div className="w-full max-w-md bg-surface-container-lowest/80 border border-surface-container-high rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <Logo size={52} showText={false} />
          <h1 className="text-2xl font-bold text-on-surface mt-1">تسجيل الدخول إلى رتل</h1>
          <p className="text-xs text-on-surface-variant max-w-xs">
            أهلاً بك مجدداً. أدخل بيانات حسابك لمزامنة علاماتك المرجعية ومتابعة الاستماع
          </p>
        </div>

        <LoginForm
          onSuccess={() => router.push('/')}
          onSwitchToRegister={() => router.push('/register')}
        />

        <div className="mt-6 pt-4 border-t border-surface-container-high flex items-center justify-center gap-1.5 text-[11px] text-outline">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>جلسة آمنة ومشفرة خالية من الإعلانات</span>
        </div>
      </div>
    </div>
  );
}
