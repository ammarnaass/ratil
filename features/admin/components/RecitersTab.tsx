'use client';

/**
 * رتل - Ratil
 * تبويب إدارة القرّاء وقواعد بياناتهم في Neon
 * features/admin/components/RecitersTab.tsx
 */

import React, { useState } from 'react';
import { Plus, Eye, EyeOff, Trash2, Edit2 } from 'lucide-react';
import type { Reciter } from '@/lib/types';
import type { ReciterFormData } from '../types/admin.types';
import { RIWAYA_OPTIONS, LICENSE_OPTIONS } from '../constants/admin.constants';
import { EditReciterModal } from './EditReciterModal';
import { CreateReciterForm } from './CreateReciterForm';

export interface RecitersTabProps {
  reciters: Reciter[];
  showAdd: boolean;
  setShowAdd: (show: boolean) => void;
  form: ReciterFormData;
  setForm: React.Dispatch<React.SetStateAction<ReciterFormData>>;
  onCreate: (e: React.FormEvent) => void;
  onUpdate?: (id: string, data: Partial<ReciterFormData>) => Promise<void> | void;
  onToggleVisibility: (reciter: Reciter) => void;
  onDelete: (id: string, name: string) => void;
}

export function RecitersTab({
  reciters,
  showAdd,
  setShowAdd,
  form,
  setForm,
  onCreate,
  onUpdate,
  onToggleVisibility,
  onDelete,
}: RecitersTabProps) {
  const [editingReciter, setEditingReciter] = useState<Reciter | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-on-surface">قائمة القرّاء المعتمدين</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-bold">
            {reciters.length} قرّاء
          </span>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{showAdd ? 'إلغاء الإضافة' : 'إضافة قارئ جديد'}</span>
        </button>
      </div>

      {showAdd && (
        <CreateReciterForm
          form={form}
          setForm={setForm}
          onSubmit={onCreate}
          onCancel={() => setShowAdd(false)}
        />
      )}

      <div className="rounded-2xl bg-surface-container border border-surface-container-high overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-surface-container-high text-on-surface-variant border-b border-surface-container-highest">
              <tr>
                <th className="p-3.5">المعرف</th>
                <th className="p-3.5">القارئ الشيخ</th>
                <th className="p-3.5">الرواية</th>
                <th className="p-3.5">الترخيص والمصدر</th>
                <th className="p-3.5">السور المتاحة</th>
                <th className="p-3.5">الحالة</th>
                <th className="p-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {reciters.map((r) => (
                <tr key={r.id} className="hover:bg-surface-container-high/40 transition-colors">
                  <td className="p-3.5 font-mono text-primary font-semibold">{r.id}</td>
                  <td className="p-3.5 font-bold text-on-surface">{r.name}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-surface-container-highest text-on-surface font-mono">
                      {r.riwaya === 'hafs' ? 'حفص' : r.riwaya === 'warsh' ? 'ورش' : r.riwaya}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-on-surface font-medium">{r.source_name}</span>
                      <span className="text-[10px] text-outline">{r.license}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-primary font-bold">
                    {r.surah_count || 114} / 114
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        r.is_visible !== false
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-surface-container-highest text-outline'
                      }`}
                    >
                      {r.is_visible !== false ? 'مرئي للعامة' : 'مخفي'}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setEditingReciter(r)}
                        title="تعديل بيانات القارئ"
                        className="p-1.5 rounded-lg bg-surface-container-high hover:text-primary transition-colors text-on-surface-variant inline-flex items-center"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onToggleVisibility(r)}
                        title={r.is_visible !== false ? 'إخفاء من الواجهة' : 'إظهار في الواجهة'}
                        className="p-1.5 rounded-lg bg-surface-container-high hover:text-primary transition-colors text-on-surface-variant inline-flex items-center"
                      >
                        {r.is_visible !== false ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => onDelete(r.id, r.name)}
                        title="حذف القارئ"
                        className="p-1.5 rounded-lg bg-surface-container-high hover:text-error transition-colors text-on-surface-variant inline-flex items-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingReciter && (
        <EditReciterModal
          isOpen={Boolean(editingReciter)}
          reciter={editingReciter}
          onClose={() => setEditingReciter(null)}
          onSave={async (id, data) => {
            if (onUpdate) {
              await onUpdate(id, data);
            }
          }}
        />
      )}
    </div>
  );
}

export default RecitersTab;
