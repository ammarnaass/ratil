'use client';

/**
 * رتل - Ratil
 * مزوّد سياق المصادقة للتطبيق (React Context Provider)
 * features/auth/components/AuthProvider.tsx
 */

import React, { useState, useEffect, useCallback } from 'react';
import type {
  AuthContextType,
  AuthCredentials,
  AuthResponse,
  RegisterInput,
  User,
} from '../types/auth.types';
import { loginApi, registerApi, logoutApi, getMeApi } from '../services/auth.service';
import { USER_STORAGE_KEY } from '../constants/auth.constants';
import { AuthContext } from '../context/auth.context';

export { AuthContext };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // استعادة الجلسة عند تشغيل التطبيق
  const refreshUser = useCallback(async () => {
    try {
      // 1. محاولة قراءة التخزين المحلي المؤقت أولاً لسرعة العرض
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(USER_STORAGE_KEY);
        if (cached) {
          try {
            setUser(JSON.parse(cached));
          } catch {
            localStorage.removeItem(USER_STORAGE_KEY);
          }
        }
      }

      // 2. التحقق الفعلي من الخادم عبر التوكن الآمن
      const remoteUser = await getMeApi();
      setUser(remoteUser);
      if (typeof window !== 'undefined') {
        if (remoteUser) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(remoteUser));
        } else {
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: AuthCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await loginApi(credentials);
      if (res.success && res.user) {
        setUser(res.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
        }
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterInput): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await registerApi(data);
      if (res.success && res.user) {
        setUser(res.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
        }
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await logoutApi();
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
