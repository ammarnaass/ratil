'use client';

/**
 * رتل - Ratil
 * نموذج إضافة قارئ جديد إلى Neon PostgreSQL
 * features/admin/components/CreateReciterForm.tsx
 */

import React from 'react';
import { Plus } from 'lucide-react';
import type { ReciterFormData } from '../types/admin.types';
import { RIWAYA_OPTIONS, LICENSE_OPTIONS } from '../constants/admin.constants';
import { parseArchiveAudioInput } from '@/features/audio';

export interface CreateReciterFormProps {
  form: ReciterFormData;
  setForm: React.Dispatch<React.SetStateAction<ReciterFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function CreateReciterForm({
  form,
  setForm,
  onSubmit,
  onCancel,
}: CreateReciterFormProps) {
  const handleSourceUrlChange = (val: string) => {
    const parsed = parseArchiveAudioInput(val);
    if (parsed.isValid && parsed.detailsUrl) {
      setForm((prev) => ({
        ...prev,
        source_url: parsed.detailsUrl,
        ...(prev.id ? {} : { id: parsed.itemId.toLowerCase().replace(/[^a-z0-9_-]/g, '_') }),
      }));
    } else {
      setForm((prev) => ({ ...prev, source_url: val }));
    }
  };

  return (
    <form
      onSubmit={onSubmit}
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
            onChange={(e) => setForm((prev) => ({ ...prev, id: e.target.value.toLowerCase().trim() }))}
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
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest"
            required
          />
        </div>

        <div>
          <label className="text-on-surface-variant block mb-1">الرواية القرآنية</label>
          <select
            value={form.riwaya}
            onChange={(e) => setForm((prev) => ({ ...prev, riwaya: e.target.value }))}
            className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest"
          >
            {RIWAYA_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-on-surface-variant block mb-1">الترخيص العلمي</label>
          <select
            value={form.license}
            onChange={(e) => setForm((prev) => ({ ...prev, license: e.target.value }))}
            className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest"
          >
            {LICENSE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-on-surface-variant block mb-1">اسم المصدر المعتمد *</label>
          <input
            type="text"
            placeholder="أرشيف الإذاعة المصرية"
            value={form.source_name}
            onChange={(e) => setForm((prev) => ({ ...prev, source_name: e.target.value }))}
            className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest"
            required
          />
        </div>

        <div>
          <label className="text-on-surface-variant block mb-1">رابط المصدر على Archive.org</label>
          <input
            type="text"
            placeholder="https://archive.org/details/..."
            value={form.source_url}
            onChange={(e) => handleSourceUrlChange(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest font-mono text-xs"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-surface-container-high">
        <button
          type="button"
          onClick={onCancel}
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
  );
}

export default CreateReciterForm;
