/**
 * رتل - Ratil
 * ثوابت نظام المصادقة
 * features/auth/constants/auth.constants.ts
 */

export const AUTH_COOKIE_NAME = 'ratil_auth_token';
export const USER_STORAGE_KEY = 'ratil_user_profile';

export const AUTH_LIMITS = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 60,
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 72,
} as const;

export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: 'تم تسجيل الدخول بنجاح',
  REGISTER_SUCCESS: 'تم إنشاء الحساب بنجاح، مرحباً بك في رتل',
  LOGOUT_SUCCESS: 'تم تسجيل الخروج بنجاح',
  INVALID_CREDENTIALS: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  USER_EXISTS: 'يوجد حساب مسجل بالفعل بهذا البريد الإلكتروني',
  UNAUTHORIZED: 'يجب تسجيل الدخول للوصول إلى هذه الميزة',
  SERVER_ERROR: 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى لاحقاً',
} as const;

export const DEFAULT_AVATARS = [
  'bg-emerald-600',
  'bg-teal-600',
  'bg-cyan-600',
  'bg-sky-600',
  'bg-indigo-600',
] as const;
