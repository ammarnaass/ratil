'use client';

/**
 * رتل - Ratil
 * خطاف مخصص لإدارة حفظ التلاوات دون إنترنت (Offline Audio Cache)
 * features/player/hooks/useOfflineAudio.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { AUDIO_CACHE_NAME } from '../constants/player.constants';

export function useOfflineAudio(audioUrl: string) {
  const [isCached, setIsCached] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !('caches' in window) || !audioUrl) return;

    let isMounted = true;
    caches.open(AUDIO_CACHE_NAME).then((cache) => {
      cache.match(audioUrl).then((matched) => {
        if (isMounted) {
          setIsCached(!!matched);
        }
      });
    });

    return () => {
      isMounted = false;
    };
  }, [audioUrl]);

  const toggleCache = useCallback(async () => {
    if (typeof window === 'undefined' || !('caches' in window) || !audioUrl) return;

    if (isCached) {
      const cache = await caches.open(AUDIO_CACHE_NAME);
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
      const cache = await caches.open(AUDIO_CACHE_NAME);
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
  }, [audioUrl, isCached]);

  return {
    isCached,
    isLoading,
    progress,
    toggleCache,
  };
}
