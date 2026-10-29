/**
 * ثوابت وإعدادات نظام المصادقة وإدارة الجلسات
 * src/features/auth/auth.constants.js
 */

export const AUTH_STORAGE_KEYS = {
  SESSION: 'ratil_auth_session',
  TOKEN: 'ratil_auth_token',
  USER_ROLE: 'ratil_auth_role',
  REMEMBER: 'ratil_auth_remember',
  LOGIN_REDIRECT: 'ratil_auth_redirect',
  USERS_REGISTRY: 'ratil_users_registry'
};

export const AUTH_ROLES = {
  GUEST: 'guest',
  USER: 'user',
  AUDITOR: 'auditor',
  ADMIN: 'admin'
};

export const RIWAYAT_PREFERENCES = {
  HAFS: 'hafs',
  WARSH: 'warsh',
  QALUN: 'qalun'
};

export const DEFAULT_ADMIN_CONFIG = {
  USERNAME: 'admin',
  EMAIL: 'admin@ratil.app',
  ROLE: AUTH_ROLES.ADMIN,
  DISPLAY_NAME: 'مدير المنصة',
  TITLE: 'مشرف المحتوى والحوكمة'
};

export const AUTH_EVENTS = {
  LOGIN_SUCCESS: 'ratil:auth:login',
  SIGNUP_SUCCESS: 'ratil:auth:signup',
  LOGOUT: 'ratil:auth:logout',
  SESSION_EXPIRED: 'ratil:auth:expired',
  UNAUTHORIZED: 'ratil:auth:unauthorized'
};
