'use client';

/**
 * رتل - Ratil
 * نافذة تعديل بيانات القارئ المعتمد
 * features/admin/components/EditReciterModal.tsx
 */

import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, Edit2 } from 'lucide-react';
import type { Reciter } from '@/lib/types';
import type { ReciterFormData } from '../types/admin.types';
import { RIWAYA_OPTIONS, LICENSE_OPTIONS } from '../constants/admin.constants';
import { parseArchiveAudioInput } from '@/features/audio';

export interface EditReciterModalProps {
  isOpen: boolean;
  reciter: Reciter | null;
  onClose: () => void;
  onSave: (id: string, data: Partial<ReciterFormData>) => Promise<void> | void;
}

export function EditReciterModal({
  isOpen,
  reciter,
  onClose,
  onSave,
}: EditReciterModalProps) {
  const [formData, setFormData] = useState<Partial<ReciterFormData>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (reciter) {
      setFormData({
        name: reciter.name,
        riwaya: reciter.riwaya,
        license: reciter.license,
        source_name: reciter.source_name,
        source_url: reciter.source_url || '',
      });
    }
  }, [reciter]);

  if (!isOpen || !reciter) return null;

  const handleSourceUrlChange = (val: string) => {
    const parsed = parseArchiveAudioInput(val);
    if (parsed.isValid && parsed.detailsUrl) {
      setFormData((prev) => ({ ...prev, source_url: parsed.detailsUrl }));
    } else {
      setFormData((prev) => ({ ...prev, source_url: val }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(reciter.id, formData);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-surface-container border border-surface-container-high rounded-3xl max-w-xl w-full p-6 flex flex-col gap-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Edit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">تعديل بيانات القارئ</h3>
              <p className="text-[11px] text-on-surface-variant font-mono">المعرف: {reciter.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-on-surface-variant block mb-1">اسم القارئ الكريم *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest"
                required
              />
            </div>

            <div>
              <label className="text-on-surface-variant block mb-1">الرواية القرآنية</label>
              <select
                value={formData.riwaya || 'hafs'}
                onChange={(e) => setFormData((prev) => ({ ...prev, riwaya: e.target.value }))}
                className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest"
              >
                {RIWAYA_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-on-surface-variant block mb-1">اسم المصدر المعتمد *</label>
              <input
                type="text"
                value={formData.source_name || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, source_name: e.target.value }))}
                className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest"
                required
              />
            </div>

            <div>
              <label className="text-on-surface-variant block mb-1">الترخيص العلمي</label>
              <select
                value={formData.license || 'Public Domain'}
                onChange={(e) => setFormData((prev) => ({ ...prev, license: e.target.value }))}
                className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest"
              >
                {LICENSE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-on-surface-variant block mb-1">رابط المصدر على Archive.org</label>
              <input
                type="text"
                placeholder="https://archive.org/details/... أو المعرف المباشر"
                value={formData.source_url || ''}
                onChange={(e) => handleSourceUrlChange(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-high">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-on-surface"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>حفظ التعديلات في Neon</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditReciterModal;
