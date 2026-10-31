'use client';

/**
 * رتل - Ratil
 * مكون نموذج إنشاء حساب جديد (RegisterForm)
 * features/auth/components/RegisterForm.tsx
 */

import React from 'react';
import { User as UserIcon, Mail, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { PasswordInput } from './PasswordInput';
import { useAuthForm } from '../hooks/useAuthForm';
import { useAuth } from '../hooks/useAuth';
import { validateRegister } from '../validators/auth.validator';
import type { RegisterInput } from '../types/auth.types';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { register } = useAuth();
  const {
    values,
    errors,
    generalError,
    isLoading,
    handleChange,
    setErrors,
    setGeneralError,
    setIsLoading,
  } = useAuthForm<RegisterInput>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateRegister(values);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setGeneralError(null);

    const res = await register(values);
    setIsLoading(false);

    if (res.success) {
      onSuccess?.();
    } else {
      setGeneralError(res.error || 'تعذر إنشاء الحساب، يرجى المحاولة لاحقاً');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 w-full" noValidate>
      {generalError && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-error-container/30 border border-error/30 text-error text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* حقل الاسم الكامل */}
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor="reg-name" className="text-xs font-semibold text-on-surface flex items-center justify-between">
          <span>الاسم الكريم</span>
          <span className="text-primary text-[10px]">*</span>
        </label>
        <div className="relative flex items-center">
          <div className="absolute right-3.5 text-on-surface-variant pointer-events-none">
            <UserIcon className="w-4 h-4 text-outline" />
          </div>
          <input
            id="reg-name"
            type="text"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="مثال: عبد الله بن أحمد"
            autoComplete="name"
            required
            className={`w-full pr-10 pl-3.5 py-2.5 rounded-xl bg-surface-container border text-sm text-on-surface placeholder:text-outline/50 focus:outline-none transition-all ${
              errors.name
                ? 'border-error focus:ring-1 focus:ring-error'
                : 'border-surface-container-high focus:border-primary focus:ring-1 focus:ring-primary'
            }`}
          />
        </div>
        {errors.name && <p className="text-xs text-error mt-0.5">{errors.name}</p>}
      </div>

      {/* حقل البريد الإلكتروني */}
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor="reg-email" className="text-xs font-semibold text-on-surface flex items-center justify-between">
          <span>البريد الإلكتروني</span>
          <span className="text-primary text-[10px]">*</span>
        </label>
        <div className="relative flex items-center">
          <div className="absolute right-3.5 text-on-surface-variant pointer-events-none">
            <Mail className="w-4 h-4 text-outline" />
          </div>
          <input
            id="reg-email"
            type="email"
            value={values.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="name@example.com"
            autoComplete="email"
            dir="ltr"
            required
            className={`w-full pr-10 pl-3.5 py-2.5 rounded-xl bg-surface-container border text-sm text-on-surface placeholder:text-outline/50 focus:outline-none transition-all text-right ${
              errors.email
                ? 'border-error focus:ring-1 focus:ring-error'
                : 'border-surface-container-high focus:border-primary focus:ring-1 focus:ring-primary'
            }`}
          />
        </div>
        {errors.email && <p className="text-xs text-error mt-0.5">{errors.email}</p>}
      </div>

      {/* كلمة المرور */}
      <PasswordInput
        id="reg-password"
        value={values.password}
        onChange={(val) => handleChange('password', val)}
        error={errors.password}
        autoComplete="new-password"
        label="كلمة المرور (6 أحرف على الأقل)"
      />

      {/* تأكيد كلمة المرور */}
      <PasswordInput
        id="reg-confirm-password"
        value={values.confirmPassword || ''}
        onChange={(val) => handleChange('confirmPassword', val)}
        error={errors.confirmPassword}
        autoComplete="new-password"
        label="تأكيد كلمة المرور"
      />

      {/* زر إنشاء الحساب */}
      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary-focus transition-all duration-200 shadow-md hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>جاري إنشاء الحساب...</span>
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            <span>إنشاء الحساب</span>
          </>
        )}
      </button>

      {/* تبديل إلى تسجيل الدخول */}
      {onSwitchToLogin && (
        <div className="text-center text-xs text-on-surface-variant pt-2 border-t border-surface-container-high">
          <span>لديك حساب بالفعل؟ </span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary hover:text-primary-focus font-bold transition-colors underline-offset-4 hover:underline"
          >
            تسجيل الدخول
          </button>
        </div>
      )}
    </form>
  );
}
