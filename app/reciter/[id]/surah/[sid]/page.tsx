/**
 * رتل - Ratil
 * استماع لسورة محددة بقارئ محدد (SSG)
 * app/reciter/[id]/surah/[sid]/page.tsx
 */

import { notFound } from 'next/navigation';
import { getReciterWithSurahs, getAllReciterIds, getVisibleReciters } from '@/lib/queries/reciters';
import SurahText from '@/components/SurahText';
import Player from '@/components/Player';
import surahs from '@/data/surahs.json';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const reciterIds = await getAllReciterIds();
  const params: { id: string; sid: string }[] = [];

  for (const id of reciterIds) {
    for (const s of surahs) {
      params.push({ id, sid: String(s.id) });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string; sid: string };
}): Promise<Metadata> {
  const surah = surahs.find((s) => s.id === Number(params.sid));
  const reciter = await getReciterWithSurahs(params.id);
  const sName = surah?.ar || surah?.name_ar || params.sid;
  const rName = reciter?.name || params.id;

  return {
    title: `سورة ${sName} بصوت ${rName} — رتّل`,
    description: `استمع لسورة ${sName} بصوت القارئ ${rName} بروابط Archive.org المباشرة مع النص القرآني المعتمد.`,
  };
}

export default async function ReciterSurahPage({
  params,
}: {
  params: { id: string; sid: string };
}) {
  const surahId = Number(params.sid);
  const surah = surahs.find((s) => s.id === surahId);
  const reciter = await getReciterWithSurahs(params.id);

  if (!surah || !reciter) notFound();

  const allReciters = await getVisibleReciters();
  const surahName = surah.ar || surah.name_ar || `السورة ${surahId}`;

  // ترتيب القرّاء بحيث يكون القارئ المحدد هو الأول
  const sortedReciters = [reciter, ...allReciters.filter((r) => r.id !== reciter.id)];

  return (
    <div className="w-full flex flex-col gap-8 max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* شريط التنقل والرجوع */}
      <div className="flex items-center justify-between text-xs text-on-surface-variant">
        <Link
          href={`/reciter/${reciter.id}`}
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لملف القارئ: {reciter.name}</span>
        </Link>
        <span className="text-primary font-medium">
          سورة {surahName} • {reciter.name}
        </span>
      </div>

      {/* النص القرآني المعتمد */}
      <SurahText
        surah={surah as any}
        riwaya={reciter.riwaya === 'warsh' ? 'warsh' : 'hafs'}
      />

      {/* المشغل الصوتي */}
      <Player
        surahId={surahId}
        surahName={surahName}
        reciters={sortedReciters}
      />
    </div>
  );
}
