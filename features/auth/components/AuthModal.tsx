'use client';

/**
 * رتل - Ratil
 * نافذة حوارية منبثقة لتسجيل الدخول / إنشاء حساب (AuthModal)
 * features/auth/components/AuthModal.tsx
 */

import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { Logo } from '@/features/navigation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md bg-surface border border-surface-container-high rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors focus:outline-none"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* رأس النافذة مع الشعار */}
        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <Logo size={48} showText={false} />
          <h2 className="text-xl font-bold text-on-surface mt-1">
            {mode === 'login' ? 'مرحباً بك مجدداً في رتل' : 'إنشاء حساب جديد في رتل'}
          </h2>
          <p className="text-xs text-on-surface-variant max-w-xs">
            {mode === 'login'
              ? 'سجّل دخولك لمزامنة المحفوظات ومتابعة تلاواتك المفضلة'
              : 'انضم إلينا للاستماع إلى تلاوات كبار القرّاء ومزامنة علاماتك'}
          </p>

          {/* تبويبات التبديل السريع */}
          <div className="flex items-center p-1 bg-surface-container rounded-xl border border-surface-container-high mt-2 w-full">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              حساب جديد
            </button>
          </div>
        </div>

        {/* جسم النموذج */}
        {mode === 'login' ? (
          <LoginForm
            onSuccess={onClose}
            onSwitchToRegister={() => setMode('register')}
          />
        ) : (
          <RegisterForm
            onSuccess={onClose}
            onSwitchToLogin={() => setMode('login')}
          />
        )}

        {/* شارة الخصوصية في الأسفل */}
        <div className="mt-5 pt-4 border-t border-surface-container-high flex items-center justify-center gap-1.5 text-[11px] text-outline">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>بياناتك محمية ومشفرة بأعلى المعايير الأمنية</span>
        </div>
      </div>
    </div>
  );
}
