'use client';

/**
 * رتل - Ratil
 * خطاف مخصص لإدارة البحث الذكي في السور والفهرس العربي المطبع
 * features/quran/hooks/useSurahSearch.ts
 */

import { useState, useEffect, useMemo } from 'react';
import type { SearchItem } from '../types/quran.types';
import type { SurahRevelationFilter } from '../constants/quran.constants';
import { normalizeArabic } from '@/lib/normalize';

export function useSurahSearch(initialSurahs: SearchItem[] = []) {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<SurahRevelationFilter>('all');
  const [surahsList, setSurahsList] = useState<SearchItem[]>(initialSurahs);
  const [isFocused, setIsFocused] = useState(false);

  // تحميل فهرس البحث الثابت إذا لم يُمرر مبدئياً
  useEffect(() => {
    if (surahsList.length === 0) {
      let isMounted = true;
      fetch('/search-index.json')
        .then((res) => res.json())
        .then((data) => {
          if (isMounted) setSurahsList(data);
        })
        .catch((err) => console.warn('Could not load search-index.json:', err));

      return () => {
        isMounted = false;
      };
    }
  }, [surahsList.length]);

  const filteredSurahs = useMemo(() => {
    const rawQuery = query.trim();
    const normQuery = normalizeArabic(rawQuery).toLowerCase();

    return surahsList.filter((s) => {
      // تصفية حسب النوع (مكية / مدنية)
      if (filterType !== 'all' && s.type !== filterType) {
        return false;
      }

      if (!normQuery) return true;

      // مطابقة رقم السورة المباشر
      if (String(s.id) === rawQuery) return true;

      // مطابقة الاسم العربي العادي والمُطبَّع
      const name = s.name || s.name_ar || '';
      const normName = s.name_normalized || normalizeArabic(name);
      if (name.includes(rawQuery) || normName.includes(normQuery)) return true;

      // مطابقة الاسم اللاتيني والإنجليزية
      if (s.name_en && s.name_en.toLowerCase().includes(normQuery)) return true;
      if (s.latin && s.latin.some((lat) => lat.toLowerCase().includes(normQuery))) return true;

      return false;
    });
  }, [surahsList, query, filterType]);

  return {
    query,
    setQuery,
    filterType,
    setFilterType,
    isFocused,
    setIsFocused,
    filteredSurahs,
  };
}
