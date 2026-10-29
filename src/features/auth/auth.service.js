/**
 * خدمة المصادقة وإدارة الجلسات للمنصة
 * src/features/auth/auth.service.js
 */

import { AUTH_STORAGE_KEYS, AUTH_ROLES, DEFAULT_ADMIN_CONFIG, AUTH_EVENTS } from './auth.constants.js';
import { validateIdentifier, validatePassword } from './auth.validator.js';

export class AuthService {
  constructor(storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
    this.storage = storage;
  }

  getCurrentSession() {
    if (!this.storage) return null;
    try {
      const raw = this.storage.getItem(AUTH_STORAGE_KEYS.SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated() {
    const session = this.getCurrentSession();
    return !!(session && session.token && session.expiresAt > Date.now());
  }

  isAdmin() {
    const session = this.getCurrentSession();
    return !!(this.isAuthenticated() && session?.role === AUTH_ROLES.ADMIN);
  }

  async login(identifier, password, remember = true) {
    const idCheck = validateIdentifier(identifier);
    if (!idCheck.valid) return { success: false, error: idCheck.error };

    const pwdCheck = validatePassword(password);
    if (!pwdCheck.valid) return { success: false, error: pwdCheck.error };

    const cleanId = idCheck.value.toLowerCase();

    // التحقق من صلاحيات المدير (Admin) أو المستخدم العادي
    const isAdminId = cleanId === DEFAULT_ADMIN_CONFIG.USERNAME || cleanId === DEFAULT_ADMIN_CONFIG.EMAIL;
    const role = isAdminId ? AUTH_ROLES.ADMIN : AUTH_ROLES.USER;
    const displayName = isAdminId ? DEFAULT_ADMIN_CONFIG.DISPLAY_NAME : cleanId.split('@')[0];

    const session = {
      userId: isAdminId ? 'admin-001' : 'user-' + Math.random().toString(36).slice(2, 9),
      identifier: cleanId,
      displayName,
      role,
      token: 'ratil_tok_' + Math.random().toString(36).substring(2) + Date.now(),
      createdAt: Date.now(),
      expiresAt: Date.now() + (remember ? 30 * 24 * 3600 * 1000 : 24 * 3600 * 1000)
    };

    if (this.storage) {
      this.storage.setItem(AUTH_STORAGE_KEYS.SESSION, JSON.stringify(session));
      this.storage.setItem(AUTH_STORAGE_KEYS.USER_ROLE, role);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGIN_SUCCESS, { detail: session }));
    }

    return { success: true, session };
  }

  logout() {
    if (this.storage) {
      this.storage.removeItem(AUTH_STORAGE_KEYS.SESSION);
      this.storage.removeItem(AUTH_STORAGE_KEYS.USER_ROLE);
      this.storage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGOUT));
    }

    return { success: true };
  }
}

export const authService = new AuthService();
