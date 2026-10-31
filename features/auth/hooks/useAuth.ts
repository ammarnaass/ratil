'use client';

/**
 * رتل - Ratil
 * خطاف استهلاك سياق المصادقة (useAuth Hook)
 * features/auth/hooks/useAuth.ts
 */

import { useContext } from 'react';
import { AuthContext } from '../context/auth.context';
import type { AuthContextType } from '../types/auth.types';

const defaultAuthContext: AuthContextType = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => ({ success: false, error: 'غير متصل بمزوّد المصادقة' }),
  register: async () => ({ success: false, error: 'غير متصل بمزوّد المصادقة' }),
  logout: async () => {},
  refreshUser: async () => {},
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    return defaultAuthContext;
  }
  return context;
}
