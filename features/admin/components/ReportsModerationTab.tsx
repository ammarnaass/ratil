/**
 * رتل - Ratil
 * الشاشة 15: مركز تدقيق ومراجعة بلاغات المستخدمين
 * features/admin/components/ReportsModerationTab.tsx
 */

import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Clock, Check, Trash2, MessageSquare } from 'lucide-react';
import type { AdminReport } from '../types/admin.types';

interface ReportsModerationTabProps {
  reports: AdminReport[];
  onResolveReport: (id: number, status: 'reviewed' | 'closed') => Promise<void>;
}

export function ReportsModerationTab({
  reports,
  onResolveReport,
}: ReportsModerationTabProps) {
  const [filter, setFilter] = useState<'all' | 'new' | 'reviewed' | 'closed'>('all');

  const filtered = reports.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* شريط الإحصائيات والتصفية */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-on-surface">بلاغات التدقيق العلمي</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-bold">
            {reports.length} بلاغات مسجلة
          </span>
        </div>

        <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-surface-container-high text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'all' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant'}`}
          >
            الكل ({reports.length})
          </button>
          <button
            onClick={() => setFilter('new')}
            className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'new' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant'}`}
          >
            جديدة ({reports.filter((r) => r.status === 'new').length})
          </button>
          <button
            onClick={() => setFilter('reviewed')}
            className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'reviewed' ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant'}`}
          >
            مراجعة
          </button>
        </div>
      </div>

      {/* قائمة البلاغات */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-on-surface-variant bg-surface-container rounded-2xl border border-surface-container-high flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-outline">
            <CheckCircle className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-sm text-on-surface">لا توجد بلاغات تطابق التصفية الحالية</span>
          <p className="text-[11px] max-w-sm text-outline">
            جميع البلاغات العلمية المرسلة من مستخدمي التطبيق تم تدقيقها مقابل المصحف المعتمد.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((rep) => (
            <div
              key={rep.id}
              className="p-5 rounded-2xl bg-surface-container border border-surface-container-high shadow-sm flex flex-col gap-3 text-xs"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface font-mono font-bold">
                    #{rep.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                    rep.status === 'new'
                      ? 'bg-error-container text-on-error-container'
                      : rep.status === 'reviewed'
                      ? 'bg-secondary/20 text-secondary'
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {rep.status === 'new' ? 'بلاغ جديد' : rep.status === 'reviewed' ? 'قيد المراجعة' : 'تم الحل'}
                  </span>
                  <span className="text-on-surface-variant text-[11px]">
                    نوع البلاغ: <strong className="text-on-surface">{rep.type}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {rep.status !== 'reviewed' && (
                    <button
                      onClick={() => onResolveReport(rep.id, 'reviewed')}
                      className="px-3 py-1.5 rounded-lg bg-surface-container-high text-secondary hover:bg-secondary/10 transition-colors font-bold text-[11px] flex items-center gap-1"
                    >
                      <Clock className="w-3 h-3" />
                      <span>قيد المراجعة</span>
                    </button>
                  )}
                  {rep.status !== 'closed' && (
                    <button
                      onClick={() => onResolveReport(rep.id, 'closed')}
                      className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-bold text-[11px] hover:opacity-90 transition-all flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3 h-3" />
                      <span>اعتماد كـ "تم الحل"</span>
                    </button>
                  )}
                </div>
              </div>

              {/* تفاصيل السورة والآية والوصف */}
              <div className="p-3.5 rounded-xl bg-surface-container-high flex flex-col gap-2">
                {(rep.surah_number || rep.ayah_number) && (
                  <div className="flex items-center gap-3 text-[11px] text-outline font-mono border-b border-surface-container-highest pb-2">
                    {rep.surah_number && <span>السورة رقم: {rep.surah_number}</span>}
                    {rep.ayah_number && <span>الآية رقم: {rep.ayah_number}</span>}
                    {rep.reciter_id && <span>القارئ: {rep.reciter_id}</span>}
                  </div>
                )}
                <p className="text-on-surface leading-relaxed text-xs">
                  {rep.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-outline pt-1">
                <span>تاريخ الإرسال: {new Date(rep.created_at).toLocaleString('ar-SA')}</span>
                {rep.admin_notes && (
                  <span className="text-primary italic font-medium">ملاحظة المدير: {rep.admin_notes}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
