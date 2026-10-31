'use client';

/**
 * رتل - Ratil
 * سياق تفضيلات خط المصحف والقراءة (Quran Font Context)
 * features/theme/context/quran-font.context.ts
 */

import { createContext } from 'react';
import type { QuranFontContextType } from '../types/typography.types';

export const QuranFontContext = createContext<QuranFontContextType | undefined>(undefined);
