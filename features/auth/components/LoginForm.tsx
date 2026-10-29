'use client';

/**
 * رتل - Ratil
 * استمارة تسجيل الدخول (LoginForm)
 * features/auth/components/LoginForm.tsx
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { validateLoginInput } from '../validators/auth.validator';
import { AUTH_ROUTES } from '../constants/auth.constants';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateLoginInput({ email, password });
    if (!validation.isValid) {
      setError(validation.error || 'بيانات غير صحيحة');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login({ email, password });
      if (res.success) {
        router.push(AUTH_ROUTES.PROFILE);
        router.refresh();
      } else {
        setError(res.error || 'بيانات الاعتماد غير مطابقة');
      }
    } catch {
      setError('حدث خطأ غير متوقع، يرجى المحاولة لاحقاً');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs leading-relaxed">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-on-surface-variant">البريد الإلكتروني</label>
        <div className="relative flex items-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            dir="ltr"
            required
            className="w-full bg-surface-container-low border border-surface-container-high rounded-xl py-2.5 px-3 pl-10 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors text-left"
          />
          <Mail className="w-4 h-4 text-outline absolute left-3 pointer-events-none" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-on-surface-variant">كلمة المرور</label>
        <div className="relative flex items-center">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            dir="ltr"
            required
            className="w-full bg-surface-container-low border border-surface-container-high rounded-xl py-2.5 px-3 pl-10 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors text-left"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 text-outline hover:text-on-surface transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>جاري التحقق...</span>
          </>
        ) : (
          <span>تسجيل الدخول</span>
        )}
      </button>

      <div className="text-center mt-2">
        <span className="text-xs text-on-surface-variant">ليس لديك حساب؟ </span>
        <Link
          href={AUTH_ROUTES.REGISTER}
          className="text-xs font-semibold text-primary hover:underline"
        >
          إنشاء حساب جديد
        </Link>
      </div>
    </form>
  );
}
