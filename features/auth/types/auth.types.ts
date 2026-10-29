/**
 * رتل - Ratil
 * أنواع ومعرّفات نظام المصادقة والمستخدمين
 * features/auth/types/auth.types.ts
 */

export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthSession {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface SyncDataPayload {
  bookmarks?: Array<{
    surahId: number;
    ayahNumber: number;
    ayahText?: string;
    riwaya?: string;
    timestamp?: number;
  }>;
  lastPlayed?: {
    reciterId: string;
    surahNumber: number;
    ayahNumber?: number;
    progressSeconds?: number;
    updatedAt?: number;
  };
}

export interface SyncResponse {
  success: boolean;
  bookmarksCount?: number;
  lastPlayedSynced?: boolean;
  error?: string;
}
