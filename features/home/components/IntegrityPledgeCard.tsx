'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Fingerprint,
  UserCheck,
  HardDriveDownload,
  CheckCircle2,
  ChevronDown,
  Info,
} from 'lucide-react';
import { INTEGRITY_PLEDGE_DETAILS } from '../constants/home.constants';

/**
 * رتل - Ratil
 * بطاقة ميثاق سلامة النص القرآني والتسجيلات الموثقة
 * features/home/components/IntegrityPledgeCard.tsx
 */
export function IntegrityPledgeCard() {
  const [showChecksums, setShowChecksums] = useState(false);

  const getPledgeIcon = (type: string) => {
    switch (type) {
      case 'fingerprint':
        return <Fingerprint className="w-4 h-4 text-primary" />;
      case 'user-check':
        return <UserCheck className="w-4 h-4 text-primary" />;
      case 'cloud-download':
        return <HardDriveDownload className="w-4 h-4 text-primary" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="w-full lg:w-96 rounded-3xl bg-surface-container-high/70 p-6 border border-primary/25 hover:border-primary/45 flex flex-col gap-4 shrink-0 shadow-xl backdrop-blur-md transition-all duration-300 relative group overflow-hidden">
      {/* وميض خلفي ناعم */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/15 transition-all" />

      {/* الترويسة الرئيسية للبطاقة */}
      <div className="flex items-center justify-between border-b border-surface-container-highest pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary border border-primary/30 shadow-inner">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-on-surface">ميثاق سلامة النص والصوت</span>
            <span className="text-[11px] text-primary font-medium">معتمد ومحقق برمجياً</span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-primary/15 text-primary font-semibold border border-primary/30">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          SHA-256
        </span>
      </div>

      {/* بنود الميثاق الثلاثة */}
      <div className="flex flex-col gap-3">
        {INTEGRITY_PLEDGE_DETAILS.map((pledge) => (
          <div
            key={pledge.id}
            className="flex items-start gap-3 p-2.5 rounded-2xl bg-surface-container/50 hover:bg-surface-container border border-surface-container-high hover:border-primary/30 transition-all duration-200 group/item"
          >
            <div className="w-7 h-7 rounded-xl bg-surface-container-highest flex items-center justify-center shrink-0 mt-0.5 group-hover/item:scale-105 transition-transform">
              {getPledgeIcon(pledge.icon)}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-on-surface group-hover/item:text-primary transition-colors">
                  {pledge.title}
                </span>
                <span className="text-[10px] text-primary/80 font-medium px-1.5 py-0.2 rounded bg-primary/10 shrink-0">
                  {pledge.badge}
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                {pledge.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* زر تفاصيل البصمات الرقمية المرجعية */}
      <div className="pt-1">
        <button
          onClick={() => setShowChecksums(!showChecksums)}
          className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-surface-container/80 hover:bg-surface-container text-xs text-on-surface-variant hover:text-primary transition-all border border-surface-container-high"
        >
          <span className="flex items-center gap-1.5 text-[11px]">
            <Info className="w-3.5 h-3.5 text-primary" />
            <span>عرض البصمات الرقمية للنص والخطوط</span>
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              showChecksums ? 'rotate-180 text-primary' : ''
            }`}
          />
        </button>

        {showChecksums && (
          <div className="mt-2.5 p-3 rounded-xl bg-surface-container-lowest/90 border border-primary/20 text-[10px] flex flex-col gap-2 font-mono text-on-surface-variant animate-in fade-in duration-200">
            <div className="flex flex-col gap-0.5">
              <span className="text-primary font-bold">حفص (Tanzil v1.1):</span>
              <span className="text-[9px] text-on-surface select-all break-all bg-surface-container p-1 rounded border border-surface-container-high">
                18c719bb3ba26d32ef457f40dad77cd28c4c5a34156833e26a8e5fcfdd246fb1
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-primary font-bold">ورش (مجمع الملك فهد v10):</span>
              <span className="text-[9px] text-on-surface select-all break-all bg-surface-container p-1 rounded border border-surface-container-high">
                f05d0dc652fd46b38563cacb13242f76f80db4cc64d25873da0bce157253872f
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IntegrityPledgeCard;

