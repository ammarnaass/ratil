/**
 * رتل - Ratil
 * دوال التحقق من صحة المدخلات لنظام المصادقة
 * features/auth/validators/auth.validator.ts
 */

import type { LoginCredentials, RegisterCredentials } from '../types/auth.types';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: 'البريد الإلكتروني مطلوب' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'صيغة البريد الإلكتروني غير صحيحة' };
  }
  return { isValid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'كلمة المرور مطلوبة' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'يجب أن لا تقل كلمة المرور عن 6 أحرف أو أرقام' };
  }
  return { isValid: true };
}

export function validateName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: 'الاسم الكريم مطلوب' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'الاسم يجب أن يتكون من حرفين على الأقل' };
  }
  return { isValid: true };
}

export function validateLoginInput(creds: LoginCredentials): ValidationResult {
  const emailVal = validateEmail(creds.email);
  if (!emailVal.isValid) return emailVal;

  const passVal = validatePassword(creds.password);
  if (!passVal.isValid) return passVal;

  return { isValid: true };
}

export function validateRegisterInput(creds: RegisterCredentials): ValidationResult {
  const nameVal = validateName(creds.name);
  if (!nameVal.isValid) return nameVal;

  const emailVal = validateEmail(creds.email);
  if (!emailVal.isValid) return emailVal;

  const passVal = validatePassword(creds.password);
  if (!passVal.isValid) return passVal;

  if (creds.confirmPassword !== undefined && creds.password !== creds.confirmPassword) {
    return { isValid: false, error: 'كلمتا المرور غير متطابقتين' };
  }

  return { isValid: true };
}
