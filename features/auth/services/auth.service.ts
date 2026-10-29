/**
 * رتل - Ratil
 * خدمة استدعاءات API للمصادقة على جانب العميل
 * features/auth/services/auth.service.ts
 */

import { API_AUTH_ENDPOINTS } from '../constants/auth.constants';
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  SyncDataPayload,
  SyncResponse,
  User,
} from '../types/auth.types';

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const res = await fetch(API_AUTH_ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return res.json();
}

export async function registerUser(credentials: RegisterCredentials): Promise<AuthResponse> {
  const res = await fetch(API_AUTH_ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return res.json();
}

export async function logoutUser(): Promise<boolean> {
  try {
    const res = await fetch(API_AUTH_ENDPOINTS.LOGOUT, { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch(API_AUTH_ENDPOINTS.ME);
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export async function syncUserData(payload: SyncDataPayload): Promise<SyncResponse> {
  try {
    const res = await fetch(API_AUTH_ENDPOINTS.SYNC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  } catch (e: any) {
    return { success: false, error: e.message || 'فشلت عملية المزامنة' };
  }
}

export async function fetchUserCloudData(): Promise<{
  bookmarks: any[];
  lastPlayed: any | null;
}> {
  try {
    const res = await fetch(API_AUTH_ENDPOINTS.SYNC);
    if (!res.ok) return { bookmarks: [], lastPlayed: null };
    return res.json();
  } catch {
    return { bookmarks: [], lastPlayed: null };
  }
}
