'use client';

/**
 * رتل - Ratil
 * سياق المصادقة الأساسي (Auth Context)
 * features/auth/context/auth.context.ts
 */

import { createContext } from 'react';
import type { AuthContextType } from '../types/auth.types';

export const AuthContext = createContext<AuthContextType | null>(null);
