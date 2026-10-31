/**
 * رتل - Ratil
 * صفحة القارئ المعتمد (SSG — ملف القارئ وتلاواته)
 * app/reciter/[id]/page.tsx
 */

import { notFound } from 'next/navigation';
import { getReciterWithSurahs, getAllReciterIds, getVisibleReciters } from '@/lib/queries/reciters';
import Player from '@/features/player';
import surahs from '@/data/surahs.json';
import Link from 'next/link';
import { Mic, ShieldCheck, CheckCircle2, Play, ArrowRight, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const reciter = await getReciterWithSurahs(params.id);
  const rName = reciter?.name || params.id;

  return {
    title: `المصحف المرتل بصوت ${rName} — رتّل`,
    description: `استمع إلى المصحف الشريف كاملاً بصوت ${rName} بروابط مباشرة من Archive.org.`,
  };
}

export default async function ReciterPage({
  params,
}: {
  params: { id: string };
}) {
  const reciter = await getReciterWithSurahs(params.id);
  if (!reciter) notFound();

  const allReciters = await getVisibleReciters();

  const riwayaLabel =
    reciter.riwaya === 'warsh'
      ? 'ورش عن نافع'
      : reciter.riwaya === 'qalon'
      ? 'قالون عن نافع'
      : 'حفص عن عاصم';

  return (
    <div className="w-full flex flex-col gap-8 max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* رجوع */}
      <div>
        <Link
          href="/reciters"
          className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لقائمة القرّاء</span>
        </Link>
      </div>

      {/* معلومات القارئ والترخيص */}
      <section className="relative overflow-hidden rounded-3xl bg-surface-container border border-surface-container-high p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary shadow-inner">
            <Mic className="w-8 h-8" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-on-surface">
                {reciter.name}
              </h1>
              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>موثق</span>
              </span>
            </div>
            <p className="text-sm text-primary font-medium">
              المصحف المرتل برواية {riwayaLabel}
            </p>
            <p className="text-xs text-on-surface-variant">
              المصدر: {reciter.source_name} • الترخيص: {reciter.license}
            </p>
          </div>
        </div>

        {reciter.source_url && (
          <a
            href={reciter.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs text-on-surface transition-colors border border-surface-container-highest"
          >
            <span>أرشيف التلاوة في Archive.org</span>
            <ExternalLink className="w-3.5 h-3.5 text-primary" />
          </a>
        )}
      </section>

      {/* قائمة سور المصحف المتاحة بصوت هذا القارئ */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-on-surface">
            سور المصحف المرتل (١١٤ سورة)
          </h2>
          <span className="text-xs text-on-surface-variant">
            روابط مباشرة بدون إعلانات
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {surahs.map((surah) => {
            const pad = String(surah.id).padStart(3, '0');
            return (
              <Link
                key={surah.id}
                href={`/reciter/${reciter.id}/surah/${surah.id}`}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container/60 hover:bg-surface-container border border-surface-container-high hover:border-primary/40 transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    {surah.id}
                  </span>
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                      سورة {surah.ar || surah.name_ar}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      {surah.type} • {surah.ayahs || surah.ayahs_hafs} آية
                    </span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                  <Play className="w-4 h-4 fill-current mr-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* مشغل الصوت */}
      <Player
        surahId={1}
        surahName="الفاتحة"
        reciters={[reciter, ...allReciters.filter((r) => r.id !== reciter.id)]}
      />
    </div>
  );
}
