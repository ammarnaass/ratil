/**
 * رتل - Ratil
 * صفحة السورة الكريمة (SSG — توليد ثابت في وقت البناء لجميع الـ 114 سورة)
 * app/surah/[id]/page.tsx
 */

import { notFound } from 'next/navigation';
import { getVisibleReciters } from '@/lib/queries/reciters';
import { SurahText } from '@/features/quran';
import Player from '@/features/player';
import surahs from '@/data/surahs.json';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, ArrowRight, BookOpen } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const surah = surahs.find((s) => s.id === Number(params.id));
  const sName = surah?.ar || surah?.name_ar || `السورة ${params.id}`;
  const sAyahs = surah?.ayahs || surah?.ayahs_hafs || 0;

  return {
    title: `سورة ${sName} — رتّل`,
    description: `استمع لسورة ${sName} (${sAyahs} آية) بصوت أشهر القرّاء بروايتي حفص وورش مع تتبع النص القرآني المعتمد.`,
    openGraph: {
      title: `سورة ${sName} — رتّل`,
      description: `استمع لسورة ${sName} (${sAyahs} آية) بصوت كبار القرّاء.`,
      siteName: 'رتّل',
      images: [
        {
          url: '/icons/icon-512.png',
          width: 512,
          height: 512,
          alt: `سورة ${sName} — رتّل`,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: `سورة ${sName} — رتّل`,
      description: `استمع لسورة ${sName} (${sAyahs} آية) بصوت كبار القرّاء.`,
      images: ['/icons/icon-512.png'],
    },
  };
}

export default async function SurahPage({
  params,
}: {
  params: { id: string };
}) {
  const surahId = Number(params.id);
  const surah = surahs.find((s) => s.id === surahId);
  if (!surah) notFound();

  // جلب القرّاء المتاحين لهذه السورة
  const reciters = await getVisibleReciters();
  const available = reciters.filter(
    (r) => !r.surahs || r.surahs.some((s: any) => s.surah_number === surahId)
  );
  const activeReciters = available.length > 0 ? available : reciters;

  const prevSurah = surahs.find((s) => s.id === surahId - 1);
  const nextSurah = surahs.find((s) => s.id === surahId + 1);

  const surahName = surah.ar || surah.name_ar || `السورة ${surahId}`;

  return (
    <div className="w-full flex flex-col gap-8 max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* شريط التنقل بين السور */}
      <div className="flex items-center justify-between py-2 border-b border-surface-container-high text-xs text-on-surface-variant">
        <Link
          href="/"
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للفهرس</span>
        </Link>

        <div className="flex items-center gap-3">
          {prevSurah && (
            <Link
              href={`/surah/${prevSurah.id}`}
              className="flex items-center gap-1 hover:text-primary transition-colors"
              title={`سورة ${prevSurah.ar || prevSurah.name_ar}`}
            >
              <span>السورة السابقة: {prevSurah.ar || prevSurah.name_ar}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}

          {nextSurah && (
            <Link
              href={`/surah/${nextSurah.id}`}
              className="flex items-center gap-1 hover:text-primary transition-colors"
              title={`سورة ${nextSurah.ar || nextSurah.name_ar}`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>السورة التالية: {nextSurah.ar || nextSurah.name_ar}</span>
            </Link>
          )}
        </div>
      </div>

      {/* عرض النص القرآني المعتمد مع ترقيم الآيات */}
      <SurahText
        surah={surah as any}
      />

      {/* مشغل الصوت الثابت على جانب العميل */}
      <Player
        surahId={surahId}
        surahName={surahName}
        reciters={activeReciters}
      />
    </div>
  );
}
