import React from 'react';
import Link from 'next/link';
import { Users, ArrowLeft } from 'lucide-react';
import type { RecitersSectionProps } from '../types/home.types';
import { ReciterCard } from '@/features/quran';

/**
 * رتل - Ratil
 * قسم عرض القرّاء المعتمدين والمشايخ في الصفحة الرئيسية
 * features/home/components/RecitersSection.tsx
 */
export function RecitersSection({ reciters }: RecitersSectionProps) {
  return (
    <section className="w-full flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-surface-container-high/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/25 shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
              أئمة التلاوة المعتمدون
            </h2>
            <span className="text-xs text-on-surface-variant">
              تلاوات بشرية كاملة بروايتي حفص وورش مع تراخيص ومصادر موثقة
            </span>
          </div>
        </div>

        <Link
          href="/reciters"
          className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-high/70 hover:bg-primary hover:text-on-primary text-xs font-semibold text-on-surface-variant transition-all duration-200 border border-surface-container-highest shadow-xs hover:scale-102"
        >
          <span>تصفح كافة القرّاء ({reciters.length})</span>
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {reciters.map((reciter) => (
          <ReciterCard key={reciter.id} reciter={reciter} />
        ))}
      </div>
    </section>
  );
}

export default RecitersSection;

