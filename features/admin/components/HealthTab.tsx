'use client';

/**
 * رتل - Ratil
 * تبويب فحص استجابة وجودة مصادر Archive.org الحية
 * features/admin/components/HealthTab.tsx
 */

import React from 'react';
import { Activity, RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import type { HealthCheckData } from '../types/admin.types';

export interface HealthTabProps {
  data: HealthCheckData | null;
  isLoading: boolean;
  onRunHealthCheck: () => void;
}

export function HealthTab({
  data,
  isLoading,
  onRunHealthCheck,
}: HealthTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="p-6 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Activity className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-bold text-on-surface">
              فحص جودة استجابة مصادر Archive.org الحية
            </h2>
            <p className="text-xs text-on-surface-variant max-w-xl leading-relaxed">
              يقوم بإرسال طلبات رأسية مجزأة (HEAD Range Requests: bytes=0-1023) للتأكد من دعم الخادم
              لتدفق الصوت اللحظي وخلوه من قيود الحظر الجغرافي.
            </p>
          </div>
        </div>

        <button
          onClick={onRunHealthCheck}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 transition-all disabled:opacity-50 shrink-0 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'جاري الفحص الحي...' : 'تشغيل الفحص السحابي الآن'}</span>
        </button>
      </div>

      {data && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high flex flex-col gap-1">
              <span className="text-[11px] text-on-surface-variant">المصادر المفحوصة</span>
              <span className="text-2xl font-bold font-mono text-on-surface">
                {data.checked}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high flex flex-col gap-1">
              <span className="text-[11px] text-on-surface-variant">المصادر السليمة (HTTP 206)</span>
              <span className="text-2xl font-bold font-mono text-primary">
                {data.ok}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high flex flex-col gap-1">
              <span className="text-[11px] text-on-surface-variant">كفاءة التوفر (Uptime)</span>
              <span className="text-2xl font-bold font-mono text-primary">
                {data.checked > 0 ? Math.round((data.ok / data.checked) * 100) : 100}%
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-container border border-surface-container-high overflow-hidden shadow-sm">
            <div className="p-4 border-b border-surface-container-high font-bold text-xs text-on-surface flex items-center justify-between">
              <span>سجل نتائج الفحص المسجلة في Neon DB</span>
              <span className="text-[11px] text-outline font-mono">health_logs table</span>
            </div>

            <div className="divide-y divide-surface-container-high">
              {data.results?.map((res, i) => (
                <div
                  key={i}
                  className="p-3.5 flex items-center justify-between gap-4 text-xs hover:bg-surface-container-high/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {res.ok ? (
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-error shrink-0" />
                    )}
                    <span className="font-bold text-on-surface font-mono">{res.reciter_id}</span>
                    <span className="text-outline font-mono truncate text-[11px] max-w-xs">
                      {res.audio_url}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        res.ok ? 'bg-primary/10 text-primary' : 'bg-error-container text-error'
                      }`}
                    >
                      HTTP {res.status || 'ERR'}
                    </span>
                    <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {res.ms}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HealthTab;
