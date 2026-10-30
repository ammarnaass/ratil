'use client';

/**
 * رتل - Ratil
 * تبويب إدارة القرّاء وقواعد بياناتهم في Neon
 * components/admin/RecitersTab.tsx
 */

import React from 'react';
import { Plus, Eye, EyeOff, Trash2 } from 'lucide-react';
import type { Reciter } from '@/lib/types';
import type { ReciterFormData } from './types';
import { RIWAYA_OPTIONS, LICENSE_OPTIONS } from './constants';

interface RecitersTabProps {
  reciters: Reciter[];
  showAdd: boolean;
  setShowAdd: (show: boolean) => void;
  form: ReciterFormData;
  setForm: React.Dispatch<React.SetStateAction<ReciterFormData>>;
  onCreate: (e: React.FormEvent) => void;
  onToggleVisibility: (reciter: Reciter) => void;
  onDelete: (id: string, name: string) => void;
}

export default function RecitersTab({
  reciters,
  showAdd,
  setShowAdd,
  form,
  setForm,
  onCreate,
  onToggleVisibility,
  onDelete,
}: RecitersTabProps) {
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
        <form
          onSubmit={onCreate}
          className="p-5 rounded-2xl bg-surface-container border border-primary/20 shadow-lg flex flex-col gap-4 text-xs"
        >
          <h3 className="font-bold text-sm text-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>بيانات القارئ الجديد (Neon PostgreSQL)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-on-surface-variant block mb-1">المعرف الفريد (ID) *</label>
              <input
                type="text"
                placeholder="al-minshawy"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value.toLowerCase().trim() })}
                className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest font-mono"
                required
              />
            </div>

            <div>
              <label className="text-on-surface-variant block mb-1">الاسم الكريم للقارئ *</label>
              <input
                type="text"
                placeholder="الشيخ محمد صديق المنشاوي"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest"
                required
              />
            </div>

            <div>
              <label className="text-on-surface-variant block mb-1">الرواية القرآنية</label>
              <select
                value={form.riwaya}
                onChange={(e) => setForm({ ...form, riwaya: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest"
              >
                {RIWAYA_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-on-surface-variant block mb-1">الترخيص العلمي</label>
              <select
                value={form.license}
                onChange={(e) => setForm({ ...form, license: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest"
              >
                {LICENSE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-on-surface-variant block mb-1">اسم المصدر المعتمد *</label>
              <input
                type="text"
                placeholder="أرشيف الإذاعة المصرية"
                value={form.source_name}
                onChange={(e) => setForm({ ...form, source_name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest"
                required
              />
            </div>

            <div>
              <label className="text-on-surface-variant block mb-1">رابط المصدر على Archive.org</label>
              <input
                type="url"
                placeholder="https://archive.org/details/..."
                value={form.source_url}
                onChange={(e) => setForm({ ...form, source_url: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-container-high">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-on-surface"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 transition-all shadow-sm"
            >
              حفظ القارئ في Neon
            </button>
          </div>
        </form>
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
    </div>
  );
}
