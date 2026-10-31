/**
 * رتل - Ratil
 * دوال التحقق من صحة المدخلات (Validation)
 * features/auth/validators/auth.validator.ts
 */

import { AUTH_LIMITS } from '../constants/auth.constants';
import type { AuthCredentials, RegisterInput } from '../types/auth.types';

export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return 'البريد الإلكتروني مطلوب';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'يرجى إدخال بريد إلكتروني صحيح';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return 'كلمة المرور مطلوبة';
  }
  if (password.length < AUTH_LIMITS.MIN_PASSWORD_LENGTH) {
    return `كلمة المرور يجب ألا تقل عن ${AUTH_LIMITS.MIN_PASSWORD_LENGTH} أحرف`;
  }
  if (password.length > AUTH_LIMITS.MAX_PASSWORD_LENGTH) {
    return `كلمة المرور يجب ألا تتجاوز ${AUTH_LIMITS.MAX_PASSWORD_LENGTH} حرفاً`;
  }
  return null;
}

export function validateName(name: string): string | null {
  if (!name || !name.trim()) {
    return 'الاسم مطلوب';
  }
  if (name.trim().length < AUTH_LIMITS.MIN_NAME_LENGTH) {
    return `الاسم يجب أن يحتوي على حرفين على الأقل`;
  }
  if (name.trim().length > AUTH_LIMITS.MAX_NAME_LENGTH) {
    return `الاسم يجب ألا يتجاوز ${AUTH_LIMITS.MAX_NAME_LENGTH} حرفاً`;
  }
  return null;
}

export function validateLogin(input: AuthCredentials): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  const emailErr = validateEmail(input.email);
  if (emailErr) errors.email = emailErr;

  const passErr = validatePassword(input.password);
  if (passErr) errors.password = passErr;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateRegister(input: RegisterInput): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  const nameErr = validateName(input.name);
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(input.email);
  if (emailErr) errors.email = emailErr;

  const passErr = validatePassword(input.password);
  if (passErr) errors.password = passErr;

  if (input.confirmPassword !== undefined && input.password !== input.confirmPassword) {
    errors.confirmPassword = 'كلمتا المرور غير متطابقتين';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
