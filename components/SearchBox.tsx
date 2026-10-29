'use client';

/**
 * رتل - Ratil
 * مكوّن البحث السريع عن السور بالمتصفح (MiniSearch / Normalized Arabic)
 * components/SearchBox.tsx
 */

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, X, BookOpen, Sparkles } from 'lucide-react';
import { normalizeArabic } from '@/lib/normalize';

interface SearchItem {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  name_normalized?: string;
  latin?: string[];
  type?: string;
  ayahs?: number;
  ayahs_hafs?: number;
  page?: number;
}

interface SearchBoxProps {
  initialSurahs?: SearchItem[];
  onSelectSurah?: (surahId: number) => void;
}

export default function SearchBox({ initialSurahs = [], onSelectSurah }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'مكية' | 'مدنية'>('all');
  const [surahsList, setSurahsList] = useState<SearchItem[]>(initialSurahs);
  const [isFocused, setIsFocused] = useState(false);

  // تحميل فهرس البحث الثابت إذا لم يُمرر مبدئياً
  useEffect(() => {
    if (surahsList.length === 0) {
      fetch('/search-index.json')
        .then((res) => res.json())
        .then((data) => setSurahsList(data))
        .catch((err) => console.warn('Could not load search-index.json:', err));
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

      // مطابقة رقم السورة
      if (String(s.id) === rawQuery) return true;

      // مطابقة الاسم العربي العادي والمُطبَّع
      const name = s.name || s.name_ar || '';
      const normName = s.name_normalized || normalizeArabic(name);
      if (name.includes(rawQuery) || normName.includes(normQuery)) return true;

      // مطابقة الاسم اللاتيني
      if (s.name_en && s.name_en.toLowerCase().includes(normQuery)) return true;
      if (s.latin && s.latin.some((lat) => lat.toLowerCase().includes(normQuery))) return true;

      return false;
    });
  }, [surahsList, query, filterType]);

  const quickPicks = [
    { id: 18, name: 'الكهف' },
    { id: 36, name: 'يس' },
    { id: 55, name: 'الرحمن' },
    { id: 56, name: 'الواقعة' },
    { id: 67, name: 'الملك' },
  ];

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

      {/* تصفيات سريعة وسور مميزة */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'all'
                ? 'bg-primary text-on-primary font-semibold'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
            }`}
          >
            جميع السور (١١٤)
          </button>
          <button
            onClick={() => setFilterType('مكية')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'مكية'
                ? 'bg-primary text-on-primary font-semibold'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
            }`}
          >
            مكية
          </button>
          <button
            onClick={() => setFilterType('مدنية')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'مدنية'
                ? 'bg-primary text-on-primary font-semibold'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
            }`}
          >
            مدنية
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-on-surface-variant">
          <Sparkles className="w-3.5 h-3.5 text-primary ml-1" />
          <span>سور شائعة:</span>
          {quickPicks.map((q) => (
            <Link
              key={q.id}
              href={`/surah/${q.id}`}
              className="px-2 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
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
