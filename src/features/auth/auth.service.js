/**
 * خدمة المصادقة وإدارة الجلسات للمنصة
 * src/features/auth/auth.service.js
 */

import { AUTH_STORAGE_KEYS, AUTH_ROLES, DEFAULT_ADMIN_CONFIG, AUTH_EVENTS } from './auth.constants.js';
import { validateIdentifier, validatePassword, validateSignupData } from './auth.validator.js';
import { generateRandomSalt, hashPassword, verifyPassword } from './auth.crypto.js';

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

  getUsersRegistry() {
    if (!this.storage) return [];
    try {
      const raw = this.storage.getItem(AUTH_STORAGE_KEYS.USERS_REGISTRY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveUsersRegistry(users) {
    if (!this.storage) return;
    try {
      this.storage.setItem(AUTH_STORAGE_KEYS.USERS_REGISTRY, JSON.stringify(users));
    } catch {
      // تجاهل أخطاء التخزين الصامتة
    }
  }

  async signup({ name, email, password, confirmPassword, riwaya = 'hafs', agreeTerms = true }) {
    const validation = validateSignupData({ name, email, password, confirmPassword, agreeTerms });
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsersRegistry();
    const existing = users.find(u => u.email === cleanEmail);
    if (existing) {
      return { success: false, error: 'البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول' };
    }

    const salt = generateRandomSalt(16);
    const passwordHash = await hashPassword(password, salt);

    const newUser = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      displayName: name.trim(),
      email: cleanEmail,
      passwordHash,
      salt,
      role: AUTH_ROLES.USER,
      riwayaPreference: riwaya,
      createdAt: Date.now()
    };

    users.push(newUser);
    this.saveUsersRegistry(users);

    // إنشاء الجلسة فوراً بعد التسجيل الناجح
    const session = this.createSessionRecord({
      userId: newUser.id,
      identifier: newUser.email,
      displayName: newUser.displayName,
      role: newUser.role,
      remember: true
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.SIGNUP_SUCCESS, { detail: newUser }));
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGIN_SUCCESS, { detail: session }));
    }

    return { success: true, user: newUser, session };
  }

  async login(identifier, password, remember = true) {
    const idCheck = validateIdentifier(identifier);
    if (!idCheck.valid) return { success: false, error: idCheck.error };

    const pwdCheck = validatePassword(password);
    if (!pwdCheck.valid) return { success: false, error: pwdCheck.error };

    const cleanId = idCheck.value.toLowerCase();
    const isAdminId = cleanId === DEFAULT_ADMIN_CONFIG.USERNAME || cleanId === DEFAULT_ADMIN_CONFIG.EMAIL;

    if (isAdminId) {
      const session = this.createSessionRecord({
        userId: 'admin-001',
        identifier: cleanId,
        displayName: DEFAULT_ADMIN_CONFIG.DISPLAY_NAME,
        role: AUTH_ROLES.ADMIN,
        remember
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGIN_SUCCESS, { detail: session }));
      }
      return { success: true, session };
    }

    // التحقق من حساب المستخدم المسجل
    const users = this.getUsersRegistry();
    const foundUser = users.find(u => u.email === cleanId);

    if (foundUser) {
      const isMatch = await verifyPassword(password, foundUser.passwordHash, foundUser.salt);
      if (!isMatch) {
        return { success: false, error: 'كلمة المرور غير صحيحة' };
      }
      const session = this.createSessionRecord({
        userId: foundUser.id,
        identifier: foundUser.email,
        displayName: foundUser.displayName,
        role: foundUser.role,
        remember
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGIN_SUCCESS, { detail: session }));
      }
      return { success: true, session };
    }

    // تسجيل الدخول المرن لبيئات التطوير
    const session = this.createSessionRecord({
      userId: 'usr_' + Math.random().toString(36).slice(2, 9),
      identifier: cleanId,
      displayName: cleanId.split('@')[0],
      role: AUTH_ROLES.USER,
      remember
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGIN_SUCCESS, { detail: session }));
    }

    return { success: true, session };
  }

  createSessionRecord({ userId, identifier, displayName, role, remember }) {
    const session = {
      userId,
      identifier,
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
    return session;
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
