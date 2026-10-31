import React from 'react';
import Link from 'next/link';
import { Play, Radio, BookOpen, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import type { HomeHeroProps } from '../types/home.types';
import {
  DEFAULT_INITIAL_SURAH_ID,
  DEFAULT_INITIAL_SURAH_NAME,
} from '../constants/home.constants';
import IntegrityPledgeCard from './IntegrityPledgeCard';

/**
 * رتل - Ratil
 * قسم البطل للترحيب واستئناف التلاوة المتقنة (Hero Section)
 * features/home/components/HomeHero.tsx
 */
export function HomeHero({
  quickSurahId = DEFAULT_INITIAL_SURAH_ID,
  quickSurahName = DEFAULT_INITIAL_SURAH_NAME,
}: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-container via-surface-container/90 to-surface-container-low border border-surface-container-high/80 p-6 sm:p-8 md:p-12 shadow-2xl backdrop-blur-xl">
      {/* هالات ضوئية فيروزية فخمة في الخلفية */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      {/* خلفية الزخرفة الإسلامية الهندسية الهادئة */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05] pointer-events-none bg-repeat"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%233ECFB2' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M30 30L15 15H0v15l15 15-15 15v15h15l15-15 15 15h15v-15l-15-15 15-15V0H45L30 15 15 0H0v15l15 15 15-15 15 15-15 15z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
        <div className="flex flex-col gap-4 max-w-2xl">
          {/* شارات الحالة المعتمدة */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-semibold border border-primary/25 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span>رتل — ثابت وسريع</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high/80 text-xs text-on-surface-variant font-medium border border-surface-container-highest">
              <Radio className="w-3.5 h-3.5 text-primary" />
              <span>تخزين صوتي دائم عبر Archive.org</span>
            </span>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high/50 text-[11px] text-on-surface-variant">
              <Zap className="w-3 h-3 text-primary" />
              <span>بث فوري عبر Range Requests</span>
            </span>
          </div>

          {/* العنوان الرئيسي */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-on-surface tracking-tight leading-[1.2]">
            مشغّل القرآن الكريم المعتمد
          </h1>

          {/* النص الترحيبي والوصفي */}
          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
            تلاوات صوتية موثقة بروايتي{' '}
            <strong className="text-on-surface font-semibold underline decoration-primary/40 underline-offset-4">
              حفص عن عاصم
            </strong>{' '}
            و{' '}
            <strong className="text-on-surface font-semibold underline decoration-primary/40 underline-offset-4">
              ورش عن نافع
            </strong>
            ، مع نصوص محققة ببصمات رقمية معتمدة، دون إعلانات ودون تتبع.
          </p>

          {/* أزرار الإجراءات السريعة مع مؤشر موجة الصوت التفاعلي */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              href={`/surah/${quickSurahId}`}
              className="group flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-primary text-on-primary font-bold text-sm hover:bg-primary-focus transition-all shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95"
            >
              {/* مؤشر تموج الصوت الحي البسيط */}
              <div className="flex items-center gap-0.5 h-4 text-on-primary">
                <span className="w-1 h-2.5 bg-current rounded-full animate-pulse" />
                <span className="w-1 h-4 bg-current rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" />
                <span className="w-1 h-1.5 bg-current rounded-full animate-pulse" />
                <span className="w-1 h-3 bg-current rounded-full animate-[pulse_1.2s_ease-in-out_infinite]" />
              </div>
              <span>سورة {quickSurahName} — استماع فوري</span>
            </Link>

            <Link
              href="/surah/1"
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-surface-container-high/90 hover:bg-surface-bright text-on-surface text-sm font-semibold transition-all border border-surface-container-highest hover:border-primary/40 shadow-sm hover:scale-[1.01]"
            >
              <BookOpen className="w-4 h-4 text-primary" />
              <span>بدء من سورة الفاتحة</span>
            </Link>
          </div>

          {/* مميزات سريعة تحت الأزرار */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-on-surface-variant/80">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>خالٍ تماماً من الإعلانات</span>
            </span>
            <span className="inline-block w-1 h-1 rounded-full bg-outline/50" />
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>وقف لوجه الله تعالى</span>
            </span>
            <span className="inline-block w-1 h-1 rounded-full bg-outline/50" />
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-primary" />
              <span>دعم الاستماع دون إنترنت</span>
            </span>
          </div>
        </div>

        {/* بطاقة توثيق البصمة والضمان */}
        <IntegrityPledgeCard />
      </div>
    </section>
  );
}

export default HomeHero;

