/**
 * رتل - Ratil
 * صفحة القرّاء المعتمدين (SSG)
 * app/reciters/page.tsx
 */

import { getVisibleReciters } from '@/lib/queries/reciters';
import { ReciterCard } from '@/features/quran';
import Link from 'next/link';
import { Users, ArrowRight, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'القرّاء المعتمدون — رتّل',
  description: 'قائمة القرّاء المعتمدين بروايتي حفص عن عاصم وورش عن نافع مع توثيق المصادر والتراخيص.',
};

export default async function RecitersPage() {
  const reciters = await getVisibleReciters();

  return (
    <div className="w-full flex flex-col gap-8 max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* رجوع وترويسة */}
      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors w-fit"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </Link>

        <div className="flex items-center gap-3 mt-2">
          <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary border border-surface-container-high">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
              القرّاء المعتمدون
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              تلاوات بشرية خالصة موثقة المصادر ومرفوعة على Archive.org بروابط مباشرة دائمة للأبد.
            </p>
          </div>
        </div>
      </div>

      {/* ميثاق أمانة الصوت */}
      <div className="p-4 rounded-2xl bg-surface-container border border-surface-container-high flex items-center gap-3 text-xs text-on-surface-variant">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
        <span>
          <strong>أمانة الصوت:</strong> لا صوت إلا بمصدر وإذن موثّقين، وخالٍ تماماً من التلاوات المولّدة بالذكاء الاصطناعي.
        </span>
      </div>

      {/* بطاقات القرّاء */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reciters.map((reciter) => (
          <ReciterCard key={reciter.id} reciter={reciter} />
        ))}
      </div>
    </div>
  );
}
