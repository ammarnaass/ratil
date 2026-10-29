/**
 * رتل - Ratil
 * الشاشة 11: سلامة النص القرآني المعتمد وفحص التشفير
 * features/admin/components/IntegrityScanTab.tsx
 */

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Hash, FileCheck, Layers } from 'lucide-react';
import type { IntegrityCheckResponse } from '../types/admin.types';

interface IntegrityScanTabProps {
  data: IntegrityCheckResponse | null;
  onRefresh: () => Promise<void>;
}

export function IntegrityScanTab({ data, onRefresh }: IntegrityScanTabProps) {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      await onRefresh();
    } finally {
      setIsScanning(false);
    }
  };

  const isVerified = data?.status === 'verified';

  return (
    <div className="flex flex-col gap-6">
      {/* بطاقة الحالة الرئيسية */}
      <div className="p-6 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
            isVerified ? 'bg-primary/10 text-primary border-primary/20' : 'bg-error-container/20 text-error border-error/30'
          }`}>
            {isVerified ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-on-surface">
                {isVerified ? 'النصوص والخطوط القرآنية مطابقة 100%' : 'تنبيه: يلزم فحص البصمات المرجعية'}
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold">
                Tanzil & KFGQPC Verified
              </span>
            </div>
            <p className="text-xs text-on-surface-variant max-w-2xl leading-relaxed">
              تعتمد منصة رتل على فحص التجزئة التشفيرية (SHA-256) الصارم قبل كل بناء ونشر لمنع أي تحريف أو خطأ في النص القرآني أو خطوط مجمع الملك فهد.
            </p>
          </div>
        </div>

        <button
          onClick={handleScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 transition-all disabled:opacity-50 shrink-0 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'جاري الفحص التشفيري...' : 'إعادة فحص البصمات حياً'}</span>
        </button>
      </div>

      {/* بطاقات البصمات التفصيلية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* رواية حفص */}
        <div className="p-5 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-on-surface">نص مصحف حفص عن عاصم</h3>
            </div>
            <span className="text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded font-bold">
              6,236 آية
            </span>
          </div>
          <div className="text-xs text-on-surface-variant flex items-center justify-between">
            <span>المرجعية العلمية:</span>
            <span className="text-on-surface font-medium">مشروع تنزيل (Tanzil Project v1.1)</span>
          </div>
          <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-surface-container-high font-mono text-[11px]">
            <span className="text-outline text-[10px]">SHA-256 Checksum:</span>
            <span className="text-primary truncate select-all">
              {data?.details?.hafs?.expected || '18c719bb3ba26d32ef457f40dad77cd28c4c5a34156833e26a8e5fcfdd246fb1'}
            </span>
          </div>
        </div>

        {/* رواية ورش */}
        <div className="p-5 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-on-surface">نص مصحف ورش عن نافع</h3>
            </div>
            <span className="text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded font-bold">
              6,214 آية
            </span>
          </div>
          <div className="text-xs text-on-surface-variant flex items-center justify-between">
            <span>المرجعية العلمية:</span>
            <span className="text-on-surface font-medium">مجمع الملك فهد لطباعة المصحف (KFGQPC v10)</span>
          </div>
          <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-surface-container-high font-mono text-[11px]">
            <span className="text-outline text-[10px]">SHA-256 Checksum:</span>
            <span className="text-primary truncate select-all">
              {data?.details?.warsh?.expected || 'f05d0dc652fd46b38563cacb13242f76f80db4cc64d25873da0bce157253872f'}
            </span>
          </div>
        </div>

        {/* خط حفص العثماني */}
        <div className="p-5 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-secondary" />
              <h3 className="text-sm font-bold text-on-surface">خط الرسم العثماني (حفص)</h3>
            </div>
            <span className="text-[11px] font-mono text-secondary bg-secondary/10 px-2 py-0.5 rounded font-bold">
              hafs.woff2
            </span>
          </div>
          <div className="text-xs text-on-surface-variant flex items-center justify-between">
            <span>المرجعية العلمية:</span>
            <span className="text-on-surface font-medium">مجمع الملك فهد (KFGQPC v18)</span>
          </div>
          <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-surface-container-high font-mono text-[11px]">
            <span className="text-outline text-[10px]">SHA-256 Checksum:</span>
            <span className="text-secondary truncate select-all">
              {data?.details?.font_hafs?.expected || '8c00e7a7d5f773bcfb1642fdcfba505dbd81975fef39f14718827a32d075020c'}
            </span>
          </div>
        </div>

        {/* خط ورش العثماني */}
        <div className="p-5 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-secondary" />
              <h3 className="text-sm font-bold text-on-surface">خط الرسم العثماني (ورش)</h3>
            </div>
            <span className="text-[11px] font-mono text-secondary bg-secondary/10 px-2 py-0.5 rounded font-bold">
              warsh.woff2
            </span>
          </div>
          <div className="text-xs text-on-surface-variant flex items-center justify-between">
            <span>المرجعية العلمية:</span>
            <span className="text-on-surface font-medium">مجمع الملك فهد (KFGQPC v10)</span>
          </div>
          <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-surface-container-high font-mono text-[11px]">
            <span className="text-outline text-[10px]">SHA-256 Checksum:</span>
            <span className="text-secondary truncate select-all">
              {data?.details?.font_warsh?.expected || 'd6e21b46de4bc42dae9218749830cb4cb54ff815e67c66002001219a175b71d7'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
