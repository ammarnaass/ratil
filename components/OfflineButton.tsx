'use client';

/**
 * رتل - Ratil
 * زر التنزيل والحفظ دون إنترنت (Offline Caching)
 * components/OfflineButton.tsx
 */

import { useState, useEffect } from 'react';
import { Download, Check, Loader2, Trash2 } from 'lucide-react';

interface OfflineButtonProps {
  audioUrl: string;
  surahId: number;
  surahName: string;
}

const CACHE_NAME = 'ratil-audio-v1';

export default function OfflineButton({ audioUrl, surahId, surahName }: OfflineButtonProps) {
  const [isCached, setIsCached] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !('caches' in window) || !audioUrl) return;

    caches.open(CACHE_NAME).then((cache) => {
      cache.match(audioUrl).then((matched) => {
        setIsCached(!!matched);
      });
    });
  }, [audioUrl]);

  const handleToggleCache = async () => {
    if (typeof window === 'undefined' || !('caches' in window) || !audioUrl) return;

    if (isCached) {
      // حذف من الكاش
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(audioUrl);
      setIsCached(false);
      return;
    }

    try {
      setIsLoading(true);
      setProgress(10);

      const response = await fetch(audioUrl);
      if (!response.ok) throw new Error('فشل جلب الملف الصوتي');

      setProgress(60);
      const cache = await caches.open(CACHE_NAME);
      await cache.put(audioUrl, response);

      setProgress(100);
      setIsCached(true);
    } catch (err) {
      console.error('Error caching audio for offline:', err);
      alert('تعذر تنزيل الملف الصوتي للاستماع دون إنترنت. يرجى التحقق من اتصال الشبكة.');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <button
      onClick={handleToggleCache}
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
