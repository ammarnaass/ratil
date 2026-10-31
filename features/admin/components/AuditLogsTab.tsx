'use client';

/**
 * رتل - Ratil
 * تبويب سجل التدقيق والرقابة الإدارية (Audit Logs Tab)
 * features/admin/components/AuditLogsTab.tsx
 */

import React, { useState } from 'react';
import { History, Search, ShieldCheck, RefreshCw } from 'lucide-react';
import type { AuditLogItem } from '../types/admin.types';

export interface AuditLogsTabProps {
  logs: AuditLogItem[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function AuditLogsTab({
  logs,
  isLoading,
  onRefresh,
}: AuditLogsTabProps) {
  const [filterAction, setFilterAction] = useState('all');

  const filteredLogs = logs.filter((log) => {
    if (filterAction === 'all') return true;
    return log.action === filterAction;
  });

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'seed_surahs':
        return { label: 'بذر سور المصحف', color: 'bg-primary/10 text-primary border-primary/20' };
      case 'update_reciter':
        return { label: 'تعديل بيانات قارئ', color: 'bg-secondary/10 text-secondary border-secondary/20' };
      case 'create_reciter':
        return { label: 'إضافة قارئ جديد', color: 'bg-primary/10 text-primary border-primary/20' };
      case 'update_user':
        return { label: 'تعديل صلاحية مستخدم', color: 'bg-surface-container-highest text-on-surface border-surface-container-highest' };
      case 'delete_user':
        return { label: 'حذف مستخدم', color: 'bg-error/10 text-error border-error/20' };
      case 'resolve_report':
        return { label: 'اعتماد حل بلاغ', color: 'bg-primary/10 text-primary border-primary/20' };
      default:
        return { label: action, color: 'bg-surface-container-highest text-on-surface-variant border-surface-container-highest' };
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* الترويسة */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-on-surface">سجل التدقيق والحوكمة الإدارية</h2>
            <p className="text-[11px] text-on-surface-variant">
              توثيق لحظي غير قابل للتعديل لكافة العمليات الإدارية التي تتم على المنصة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="p-2 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest text-xs"
          >
            <option value="all">كل العمليات</option>
            <option value="seed_surahs">بذر السور</option>
            <option value="update_reciter">تعديل القرّاء</option>
            <option value="update_user">تعديل المستخدمين</option>
            <option value="resolve_report">حل البلاغات</option>
          </select>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-all border border-surface-container-highest"
            title="تحديث السجل"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* جدول السجلات */}
      <div className="rounded-2xl bg-surface-container border border-surface-container-high overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-surface-container-high text-on-surface-variant border-b border-surface-container-highest">
              <tr>
                <th className="p-3.5">المسؤول المنفذ</th>
                <th className="p-3.5">نوع العملية</th>
                <th className="p-3.5">الهدف (Target)</th>
                <th className="p-3.5">التفاصيل</th>
                <th className="p-3.5">الوقت والتاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant text-xs">
                    لا توجد عمليات مسجلة في السجل
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const act = getActionLabel(log.action);
                  return (
                    <tr key={log.id} className="hover:bg-surface-container-high/40 transition-colors">
                      <td className="p-3.5 font-bold text-on-surface">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                          <span>{log.admin_name || log.admin_id}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${act.color}`}>
                          {act.label}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-primary">
                        {log.target_type}: {log.target_id}
                      </td>

                      <td className="p-3.5 font-mono text-[10px] text-on-surface-variant truncate max-w-[200px]" title={JSON.stringify(log.details)}>
                        {JSON.stringify(log.details || {})}
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-outline">
                        {log.created_at ? new Date(log.created_at).toLocaleString('ar-EG') : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AuditLogsTab;
