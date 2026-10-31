'use client';

/**
 * رتل - Ratil
 * زر التنزيل والحفظ دون اتصال (Offline Caching)
 * features/player/components/OfflineButton.tsx
 */

import React from 'react';
import { Download, Check, Loader2 } from 'lucide-react';
import { useOfflineAudio } from '../hooks/useOfflineAudio';

export interface OfflineButtonProps {
  audioUrl: string;
  surahId?: number;
  surahName?: string;
}

export function OfflineButton({ audioUrl }: OfflineButtonProps) {
  const { isCached, isLoading, toggleCache } = useOfflineAudio(audioUrl);

  return (
    <button
      onClick={toggleCache}
      disabled={isLoading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
        isCached
          ? 'bg-primary/10 text-primary border-primary/30 hover:bg-error/10 hover:text-error hover:border-error/30'
          : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border-surface-container-high'
      }`}
      title={isCached ? 'محفوظ دون اتصال (انقر للحذف)' : 'تنزيل للاستماع دون اتصال'}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
          <span>جاري الحفظ...</span>
        </>
      ) : isCached ? (
        <>
          <Check className="w-3.5 h-3.5 text-primary" />
          <span>متاح دون إنترنت</span>
        </>
      ) : (
        <>
          <Download className="w-3.5 h-3.5" />
          <span>حفظ للاستماع أوفلاين</span>
        </>
      )}
    </button>
  );
}

export default OfflineButton;
