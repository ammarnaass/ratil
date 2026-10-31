/**
 * رتل - Ratil
 * استدعاءات واجهة برمجة التطبيقات للمصادقة (Client-side API Service)
 * features/auth/services/auth.service.ts
 */

import type { AuthCredentials, AuthResponse, RegisterInput, User } from '../types/auth.types';

export async function loginApi(credentials: AuthCredentials): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: 'تعذر الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت',
    };
  }
}

export async function registerApi(input: RegisterInput): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: 'تعذر الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت',
    };
  }
}

export async function logoutApi(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getMeApi(): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/me', { method: 'GET' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}
