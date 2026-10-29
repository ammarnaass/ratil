/**
 * رتل - Ratil
 * ثوابت نظام المصادقة والجلسات
 * features/auth/constants/auth.constants.ts
 */

export const AUTH_COOKIE_NAME = 'ratil_auth_token';

export const AUTH_STORAGE_KEY = 'ratil_auth_user';

export const AUTH_TOKEN_EXPIRY_DAYS = 30;

export const DEFAULT_AVATAR = 'https://archive.org/download/quran-default-avatar/avatar.png';

export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  ADMIN: '/admin',
  HOME: '/',
} as const;

export const API_AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  SYNC: '/api/auth/sync',
} as const;
