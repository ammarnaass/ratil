/**
 * حارس حماية لوحة التحكم ومنع الوصول غير المصرح به
 * src/features/admin/admin.guard.js
 */

import { authService } from '../auth/auth.service.js';
import { AUTH_STORAGE_KEYS } from '../auth/auth.constants.js';

export function enforceAdminAuth({ redirectUrl = '/login' } = {}) {
  if (typeof window === 'undefined') return true;

  const isAdmin = authService.isAdmin();

  if (!isAdmin) {
    sessionStorage.setItem(AUTH_STORAGE_KEYS.LOGIN_REDIRECT, window.location.pathname);
    window.location.href = redirectUrl;
    return false;
  }

  return true;
}

export function getCurrentAdminUser() {
  return authService.getCurrentSession();
}
