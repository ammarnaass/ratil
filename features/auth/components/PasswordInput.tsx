'use client';

/**
 * رتل - Ratil
 * حقل إدخال كلمة المرور مع زر إظهار/إخفاء (PasswordInput)
 * features/auth/components/PasswordInput.tsx
 */

import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps {
  id: string;
  name?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
  label?: string;
  required?: boolean;
}

export function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder = '••••••••',
  error,
  autoComplete = 'current-password',
  label = 'كلمة المرور',
  required = true,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-on-surface flex items-center justify-between">
          <span>{label}</span>
          {required && <span className="text-primary text-[10px]">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <div className="absolute right-3.5 text-on-surface-variant pointer-events-none">
          <Lock className="w-4 h-4 text-outline" />
        </div>

        <input
          id={id}
          name={name || id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={`w-full pr-10 pl-11 py-2.5 rounded-xl bg-surface-container border text-sm text-on-surface placeholder:text-outline/50 focus:outline-none transition-all ${
            error
              ? 'border-error focus:ring-1 focus:ring-error'
              : 'border-surface-container-high focus:border-primary focus:ring-1 focus:ring-primary'
          }`}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute left-3 p-1 rounded-lg text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
          title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {error && <p className="text-xs text-error mt-0.5">{error}</p>}
    </div>
  );
}
