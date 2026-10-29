/**
 * رتل - Ratil
 * الصفحة الرئيسية (SSG — HTML ثابت فائق السرعة على Vercel Edge)
 * app/page.tsx
 */

import { getVisibleReciters } from '@/lib/queries/reciters';
import SurahList from '@/components/SurahList';
import ReciterCard from '@/components/ReciterCard';
import SearchBox from '@/components/SearchBox';
import Player from '@/components/Player';
import surahs from '@/data/surahs.json';
import { ShieldCheck, Play, Sparkles, Radio, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-static';

export default async function HomePage() {
  const reciters = await getVisibleReciters();

  return (
    <div className="w-full flex flex-col gap-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {/* 1. قسم البطل: استئناف الاستماع السريع والإتقان */}
      <section className="relative overflow-hidden rounded-3xl bg-surface-container border border-surface-container-high p-6 md:p-10 shadow-xl">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex flex-col gap-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                رتل — ثابت وسريع
              </span>
              <span className="text-xs text-on-surface-variant flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-primary" />
                تخزين صوتي دائم عبر Archive.org
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-on-surface tracking-tight leading-tight">
              مشغّل القرآن الكريم المعتمد
            </h1>

            <p className="text-base text-on-surface-variant leading-relaxed">
              تلاوات صوتية موثقة بروايتي <strong className="text-on-surface">حفص عن عاصم</strong> و<strong className="text-on-surface">ورش عن نافع</strong>، مع نصوص محققة ببصمات رقمية معتمدة، دون إعلانات ودون تتبع.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/surah/18"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-on-primary font-bold text-sm hover:bg-primary-focus transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>سورة الكهف — استماع فوري</span>
              </Link>

              <Link
                href="/surah/1"
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-sm font-medium transition-all"
              >
                <span>بدء من سورة الفاتحة</span>
              </Link>
            </div>
          </div>

          {/* بطاقة توثيق البصمة والضمان */}
          <div className="w-full lg:w-80 rounded-2xl bg-surface-container-high/80 p-5 border border-surface-container-highest flex flex-col gap-3 shrink-0">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>ميثاق سلامة النص والصوت</span>
            </div>
            <div className="flex flex-col gap-2 text-xs text-on-surface-variant leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>بصمة SHA-256 للنص القرآني مفحوصة آلياً قبل كل بناء.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>لا تلاوات مولدة بالذكاء الاصطناعي — أصوات بشرية موثقة فقط.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>روابط دائمة تدعم Range Requests للبث المباشر السلس.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. قسم البحث السريع في السور */}
      <section className="w-full">
        <SearchBox initialSurahs={surahs as any} />
      </section>

      {/* 3. قسم القرّاء المعتمدين */}
      <section className="w-full flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface">
              القرّاء المعتمدون
            </h2>
          </div>
          <span className="text-xs text-on-surface-variant">
            {reciters.length} قرّاء بتراخيص موثقة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reciters.map((reciter) => (
            <ReciterCard key={reciter.id} reciter={reciter} />
          ))}
        </div>
      </section>

      {/* 4. فهرس سور القرآن الكريم (١١٤ سورة) */}
      <section className="w-full flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface">
            سور القرآن الكريم
          </h2>
          <span className="text-xs text-on-surface-variant">
            ١١٤ سورة متوفرة بالقراءة والاستماع
          </span>
        </div>

        <SurahList surahs={surahs as any} />
      </section>

      {/* مشغل صوتي مبدئي للموقع */}
      <Player
        surahId={18}
        surahName="الكهف"
        reciters={reciters}
      />
    </div>
  );
}
