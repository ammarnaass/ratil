'use client';

/**
 * رتل - Ratil
 * خطاف مخصص لإدارة جلب آيات السورة والعلامات المرجعية (Bookmarks)
 * features/quran/hooks/useSurahVerses.ts
 */

import { useState, useEffect, useCallback } from 'react';
import type { Surah } from '@/lib/types';
import type { Verse } from '../types/quran.types';
import { isAyahBookmarked, addBookmark, removeBookmark } from '@/lib/storage';

export function useSurahVerses(surah: Surah, initialVerses?: Verse[]) {
  const [verses, setVerses] = useState<Verse[]>(initialVerses || []);
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(!initialVerses || initialVerses.length === 0);

  // تحميل آيات السورة ديناميكياً إذا لم تُمرر مسبقاً
  useEffect(() => {
    if (initialVerses && initialVerses.length > 0) {
      setVerses(initialVerses);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetch(`/data/surahs-text/${surah.id}.json`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data && data.verses) {
          setVerses(data.verses);
          setIsLoading(false);
        }
      })
      .catch(() => {
        // بديل احتياطي من quran-verses.json
        fetch('/data/quran-verses.json')
          .then((res) => res.json())
          .then((all) => {
            if (isMounted && all[surah.id]) {
              setVerses(all[surah.id]);
            }
          })
          .catch((e) => console.warn('Could not load verses dynamically:', e))
          .finally(() => {
            if (isMounted) setIsLoading(false);
          });
      });

    return () => {
      isMounted = false;
    };
  }, [surah.id, initialVerses]);

  // مزامنة حالة العلامات المرجعية لكل آية
  useEffect(() => {
    const map: Record<number, boolean> = {};
    for (const v of verses) {
      map[v.number] = isAyahBookmarked(surah.id, v.number);
    }
    setBookmarkedMap(map);
  }, [surah.id, verses]);

  const toggleBookmark = useCallback(
    (ayahNumber: number) => {
      const isSaved = bookmarkedMap[ayahNumber];
      if (isSaved) {
        removeBookmark(surah.id, ayahNumber);
        setBookmarkedMap((prev) => ({ ...prev, [ayahNumber]: false }));
      } else {
        addBookmark({
          surahId: surah.id,
          ayahNumber,
          surahName: surah.ar || surah.name_ar || `سورة ${surah.id}`,
        });
        setBookmarkedMap((prev) => ({ ...prev, [ayahNumber]: true }));
      }
    },
    [surah, bookmarkedMap]
  );

  return {
    verses,
    bookmarkedMap,
    isLoading,
    toggleBookmark,
  };
}
