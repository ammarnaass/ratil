'use client';

/**
 * رتل - Ratil
 * سياق المظهر الأساسي (Theme Context)
 * features/theme/context/theme.context.ts
 */

import { createContext } from 'react';
import type { ThemeContextType } from '../types/theme.types';

export const ThemeContext = createContext<ThemeContextType | null>(null);
