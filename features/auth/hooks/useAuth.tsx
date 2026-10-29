'use client';

/**
 * رتل - Ratil
 * مزود سياق وخطّاف المصادقة التفاعلي (Auth Context & Hook)
 * features/auth/hooks/useAuth.tsx
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, LoginCredentials, RegisterCredentials } from '../types/auth.types';
import {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  syncUserData,
  fetchUserCloudData,
} from '../services/auth.service';
import { getBookmarks, getLastPlayed } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (creds: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (creds: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  syncWithCloud: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // جلب المستخدم الحالي عند بدء التشغيل
  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const current = await getCurrentUser();
      setUser(current);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // مزامنة البيانات المحلية مع سحابة Neon
  const syncWithCloud = useCallback(async () => {
    if (!user) return;
    try {
      const localBookmarks = getBookmarks();
      const localLastPlayed = getLastPlayed();

      await syncUserData({
        bookmarks: localBookmarks.map((b) => ({
          surahId: b.surahId,
          ayahNumber: b.ayahNumber,
          ayahText: b.surahName,
          timestamp: b.timestamp,
        })),
        lastPlayed: localLastPlayed
          ? {
              reciterId: localLastPlayed.reciterId,
              surahNumber: localLastPlayed.surahId,
              ayahNumber: localLastPlayed.ayahNumber,
              progressSeconds: localLastPlayed.currentTime,
              updatedAt: localLastPlayed.updatedAt,
            }
          : undefined,
      });

      // جلب أحدث بيانات من السحابة وتحديث التخزين المحلي
      const cloud = await fetchUserCloudData();
      if (cloud.bookmarks && cloud.bookmarks.length > 0 && typeof window !== 'undefined') {
        const merged = [...localBookmarks];
        for (const cb of cloud.bookmarks) {
          if (!merged.some((m) => m.surahId === cb.surah_id && m.ayahNumber === cb.ayah_number)) {
            merged.push({
              surahId: cb.surah_id,
              ayahNumber: cb.ayah_number,
              surahName: cb.ayah_text || `سورة ${cb.surah_id}`,
              timestamp: new Date(cb.created_at).getTime(),
            });
          }
        }
        localStorage.setItem('ratil_bookmarks', JSON.stringify(merged));
      }
    } catch (e) {
      console.warn('Sync failed:', e);
    }
  }, [user]);

  const login = async (creds: LoginCredentials) => {
    const res = await loginUser(creds);
    if (res.success && res.user) {
      setUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'فشل تسجيل الدخول' };
  };

  const register = async (creds: RegisterCredentials) => {
    const res = await registerUser(creds);
    if (res.success && res.user) {
      setUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'فشل إنشاء الحساب' };
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        syncWithCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
