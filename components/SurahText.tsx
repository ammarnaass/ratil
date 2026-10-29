'use client';

/**
 * رتل - Ratil
 * مكوّن عرض النص القرآني المعتمد مع تتبع الآيات
 * components/SurahText.tsx
 */

import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Share2, Volume2, Info } from 'lucide-react';
import type { Surah } from '@/lib/types';
import { toArabicDigits } from '@/lib/normalize';
import { isAyahBookmarked, addBookmark, removeBookmark } from '@/lib/storage';

interface Verse {
  number: number;
  text: string;
}

interface SurahTextProps {
  surah: Surah;
  verses?: Verse[];
  activeAyah?: number;
  onAyahClick?: (ayahNumber: number) => void;
  riwaya?: 'hafs' | 'warsh';
}

export default function SurahText({
  surah,
  verses: initialVerses,
  activeAyah,
  onAyahClick,
  riwaya = 'hafs',
}: SurahTextProps) {
  const [verses, setVerses] = useState<Verse[]>(initialVerses || []);
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<number, boolean>>({});

  // تحميل آيات السورة إذا لم تكن ممررة مسبقاً
  useEffect(() => {
    if (!initialVerses || initialVerses.length === 0) {
      fetch(`/data/surahs-text/${surah.id}.json`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.verses) {
            setVerses(data.verses);
          }
        })
        .catch(() => {
          // Fallback fetch from quran-verses
          fetch('/data/quran-verses.json')
            .then((res) => res.json())
            .then((all) => {
              if (all[surah.id]) {
                setVerses(all[surah.id]);
              }
            })
            .catch((e) => console.warn('Could not load verses dynamically:', e));
        });
    } else {
      setVerses(initialVerses);
    }
  }, [surah.id, initialVerses]);

  // تحديث حالة المحفوظات (Bookmarks)
  useEffect(() => {
    const map: Record<number, boolean> = {};
    for (const v of verses) {
      map[v.number] = isAyahBookmarked(surah.id, v.number);
    }
    setBookmarkedMap(map);
  }, [surah.id, verses]);

  const toggleBookmark = (ayahNumber: number) => {
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
  };

  const showBismillah = surah.id !== 1 && surah.id !== 9;
  const fontClass = riwaya === 'warsh' ? 'font-quran-warsh' : 'font-quran-hafs';

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 px-4 sm:px-6">
      {/* ترويسة السورة */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-container border border-surface-container-high p-6 md:p-8 text-center flex flex-col items-center shadow-lg">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
          <span>سورة رقم {surah.id}</span>
          <span>•</span>
          <span>{surah.type}</span>
          <span>•</span>
          <span>{toArabicDigits(surah.ayahs || surah.ayahs_hafs || 0)} آية</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-on-surface mb-2 font-quran-hafs">
          سورة {surah.ar || surah.name_ar}
        </h1>
        <p className="text-sm text-on-surface-variant max-w-md">
          {surah.en || surah.name_en} • مصحف معتمد برواية {riwaya === 'warsh' ? 'ورش عن نافع' : 'حفص عن عاصم'}
        </p>

        {showBismillah && (
          <div className="mt-6 pt-6 border-t border-surface-container-high w-full max-w-md">
            <p className={`text-2xl md:text-3xl text-primary/90 ${fontClass}`}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
          </div>
        )}
      </div>

      {/* لوح النص القرآني المتصل المتقن */}
      <div className="rounded-3xl bg-surface-container/50 border border-surface-container-high p-6 md:p-10 shadow-sm leading-loose">
        <div className={`text-xl md:text-2xl lg:text-3xl text-right text-on-surface leading-[2.6] md:leading-[2.8] ${fontClass}`}>
          {verses.map((verse) => {
            const isActive = activeAyah === verse.number;
            const isSaved = bookmarkedMap[verse.number];

            return (
              <span
                key={verse.number}
                id={`ayah-${verse.number}`}
                onClick={() => onAyahClick?.(verse.number)}
                className={`inline cursor-pointer rounded-xl px-1.5 py-1 transition-all group ${
                  isActive
                    ? 'bg-primary/20 text-primary-focus ring-1 ring-primary/40 font-semibold'
                    : 'hover:bg-surface-container-high'
                }`}
                title={`الآية ${verse.number} (اضغط للاستماع)`}
              >
                <span>{verse.text}</span>
                <span className="inline-flex items-center mx-1.5 align-middle select-none">
                  <span
                    className={`ayah-number-badge text-xs font-bold tabular-nums ${
                      isActive ? 'bg-primary text-on-primary border-primary' : ''
                    }`}
                  >
                    {toArabicDigits(verse.number)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(verse.number);
                    }}
                    className={`opacity-0 group-hover:opacity-100 p-1 rounded-full text-on-surface-variant hover:text-primary transition-opacity ${
                      isSaved ? 'opacity-100 text-primary' : ''
                    }`}
                    title={isSaved ? 'إزالة من المحفوظات' : 'حفظ الآية'}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-3.5 h-3.5 fill-primary text-primary" />
                    ) : (
                      <Bookmark className="w-3.5 h-3.5" />
                    )}
                  </button>
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
