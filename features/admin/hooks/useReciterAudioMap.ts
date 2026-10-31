'use client';

/**
 * رتل - Ratil
 * خطاف مخصص لإدارة وجلب وتحديث خريطة الصوتيات المسجلة للقارئ
 * features/admin/hooks/useReciterAudioMap.ts
 */

import { useState, useEffect } from 'react';

export function useReciterAudioMap(selectedReciterId: string) {
  const [customAudioMap, setCustomAudioMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    async function loadAudio() {
      if (!selectedReciterId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/audio?reciter_id=${selectedReciterId}`);
        if (res.ok) {
          const list: any[] = await res.json();
          if (!isCancelled && Array.isArray(list)) {
            const map: Record<number, string> = {};
            list.forEach((item) => {
              map[item.surah_number] = item.audio_url;
            });
            setCustomAudioMap(map);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch audio list:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    loadAudio();
    return () => {
      isCancelled = true;
    };
  }, [selectedReciterId]);

  const updateSurahUrl = (surahNumber: number, audioUrl: string) => {
    setCustomAudioMap((prev) => ({ ...prev, [surahNumber]: audioUrl }));
  };

  return { customAudioMap, loading, updateSurahUrl };
}

export default useReciterAudioMap;
