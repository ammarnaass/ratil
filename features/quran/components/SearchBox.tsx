'use client';

/**
 * رتل - Ratil
 * صندوق البحث الذكي عن السور والآيات
 * features/quran/components/SearchBox.tsx
 */

import React from 'react';
import Link from 'next/link';
import { Search, X, BookOpen, Sparkles } from 'lucide-react';
import type { SearchBoxProps } from '../types/quran.types';
import { QUICK_SURAH_PICKS } from '../constants/quran.constants';
import { useSurahSearch } from '../hooks/useSurahSearch';

export function SearchBox({ initialSurahs = [], onSelectSurah }: SearchBoxProps) {
  const {
    query,
    setQuery,
    filterType,
    setFilterType,
    isFocused,
    setIsFocused,
    filteredSurahs,
  } = useSurahSearch(initialSurahs);

  return (
    <div id="search" className="w-full max-w-3xl mx-auto flex flex-col gap-4">
      {/* حقل البحث */}
      <div
        className={`relative flex items-center w-full bg-surface-container rounded-2xl border transition-all ${
          isFocused ? 'border-primary ring-2 ring-primary/20 shadow-lg' : 'border-surface-container-high'
        }`}
      >
        <div className="flex items-center justify-center pr-4 pl-2 text-on-surface-variant pointer-events-none">
          <Search className="w-5 h-5 text-primary" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="ابحث عن اسم السورة، رقمها، أو كتابتها بالإنجليزية (الكهف، 18، Yasin)..."
          className="w-full bg-transparent py-4 pr-1 pl-4 text-on-surface text-base md:text-lg placeholder:text-outline focus:outline-none"
        />

        {query && (
          <button
            onClick={() => setQuery('')}
            className="p-2 ml-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            title="مسح البحث"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* تصفيات سريعة وسور شائعة */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface-container/60 border border-surface-container-high/60 backdrop-blur-sm">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all duration-200 font-medium ${
              filterType === 'all'
                ? 'bg-primary text-on-primary font-bold shadow-md shadow-primary/20 scale-102'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
            }`}
          >
            جميع السور (١١٤)
          </button>
          <button
            onClick={() => setFilterType('مكية')}
            className={`px-3 py-1.5 rounded-xl transition-all duration-200 font-medium ${
              filterType === 'مكية'
                ? 'bg-primary text-on-primary font-bold shadow-md shadow-primary/20 scale-102'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
            }`}
          >
            مكية (٨٦)
          </button>
          <button
            onClick={() => setFilterType('مدنية')}
            className={`px-3 py-1.5 rounded-xl transition-all duration-200 font-medium ${
              filterType === 'مدنية'
                ? 'bg-primary text-on-primary font-bold shadow-md shadow-primary/20 scale-102'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
            }`}
          >
            مدنية (٢٨)
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-on-surface-variant">
          <Sparkles className="w-3.5 h-3.5 text-primary ml-0.5" />
          <span className="font-medium text-xs">سور شائعة:</span>
          {QUICK_SURAH_PICKS.map((q) => (
            <Link
              key={q.id}
              href={`/surah/${q.id}`}
              className="px-2.5 py-1 rounded-xl bg-surface-container/70 hover:bg-primary hover:text-on-primary text-on-surface text-xs transition-all duration-150 border border-surface-container-high/60 hover:border-primary/40 shadow-xs hover:scale-105"
            >
              {q.name}
            </Link>
          ))}
        </div>
      </div>

      {/* نتائج البحث المباشرة إذا كتب المستخدم */}
      {query.trim().length > 0 && (
        <div className="bg-surface-container rounded-2xl p-3 border border-surface-container-high shadow-xl max-h-80 overflow-y-auto flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="text-xs text-on-surface-variant px-2 py-1">
            النتائج ({filteredSurahs.length} سورة)
          </div>
          {filteredSurahs.length === 0 ? (
            <div className="py-6 text-center text-sm text-outline">
              لم نعثر على سورة مطابقة لبحثك "{query}"
            </div>
          ) : (
            filteredSurahs.map((surah) => (
              <Link
                key={surah.id}
                href={`/surah/${surah.id}`}
                onClick={() => onSelectSurah?.(surah.id)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-high transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    {surah.id}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-base font-semibold text-on-surface group-hover:text-primary transition-colors">
                      سورة {surah.name || surah.name_ar}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {surah.name_en} • {surah.type} • {surah.ayahs || surah.ayahs_hafs} آية
                    </span>
                  </div>
                </div>
                <BookOpen className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors" />
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBox;
