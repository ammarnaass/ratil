'use client';

/**
 * رتل - Ratil
 * تبويب الصوتيات وتدفق Archive.org
 * components/admin/AudioTab.tsx
 */

import React from 'react';
import { Radio, Plus, ExternalLink, CheckCircle } from 'lucide-react';
import type { Reciter } from '@/lib/types';
import type { AudioFormData } from './types';

interface AudioTabProps {
  reciters: Reciter[];
  selectedReciterId: string;
  setSelectedReciterId: (id: string) => void;
  showAdd: boolean;
  setShowAdd: (show: boolean) => void;
  form: AudioFormData;
  setForm: React.Dispatch<React.SetStateAction<AudioFormData>>;
  onSave: (e: React.FormEvent) => void;
}

export default function AudioTab({
  reciters,
  selectedReciterId,
  setSelectedReciterId,
  showAdd,
  setShowAdd,
  form,
  setForm,
  onSave,
}: AudioTabProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* بطاقات المعمارية الثلاث */}
      <div className="p-6 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col gap-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-on-surface">
            قواعد معمارية التخزين الصوتي الدائم (Archive.org)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-surface-container-high border border-surface-container-highest flex flex-col gap-1.5">
            <span className="font-bold text-primary">1. المعرف الثابت (Identifier)</span>
            <p className="text-on-surface-variant leading-relaxed font-mono text-[11px]">
              ratil-&#123;reciter&#125;
            </p>
            <span className="text-[10px] text-outline">معرف فريد ودائم في أرشيف الإنترنت</span>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-high border border-surface-container-highest flex flex-col gap-1.5">
            <span className="font-bold text-primary">2. نسق الروابط المباشرة</span>
            <p className="text-on-surface-variant leading-relaxed font-mono text-[11px] truncate">
              https://archive.org/download/ratil-&#123;id&#125;/001.mp3
            </p>
            <span className="text-[10px] text-outline">تدعم Range Requests و CORS تلقائياً</span>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-high border border-surface-container-highest flex flex-col gap-1.5">
            <span className="font-bold text-primary">3. كفاءة البث والقفز اللحظي</span>
            <p className="text-on-surface-variant leading-relaxed text-[11px]">
              استجابة سريعة HTTP 206 لتقطيع الصوت بحسب الآية دون استهلاك باقة المستخدم
            </p>
            <span className="text-[10px] text-outline">تخفيض استهلاك Bandwidth على Vercel إلى صفر</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-on-surface">استعراض سور القارئ:</span>
            <div className="flex items-center gap-1.5 bg-surface-container p-1 rounded-xl border border-surface-container-high">
              {reciters.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedReciterId(r.id);
                    setForm({ ...form, reciter_id: r.id });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedReciterId === r.id
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {r.name.replace('الشيخ ', '')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs text-on-surface border border-surface-container-high"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span>تحديث رابط سورة</span>
            </button>

            <a
              href={`https://archive.org/details/ratil-${selectedReciterId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-primary hover:underline font-mono"
            >
              <span>مجموعة Archive.org</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {showAdd && (
          <form
            onSubmit={onSave}
            className="p-4 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col gap-3 text-xs"
          >
            <h4 className="font-bold text-on-surface">إضافة أو تحديث رابط سورة صوتية في Neon</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-on-surface-variant block mb-1">القارئ</label>
                <input
                  type="text"
                  value={form.reciter_id}
                  disabled
                  className="w-full p-2 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest font-mono"
                />
              </div>
              <div>
                <label className="text-on-surface-variant block mb-1">رقم السورة (1-114)</label>
                <input
                  type="number"
                  min={1}
                  max={114}
                  value={form.surah_number}
                  onChange={(e) =>
                    setForm({ ...form, surah_number: Number(e.target.value) })
                  }
                  className="w-full p-2 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-on-surface-variant block mb-1">رابط ملف MP3</label>
                <input
                  type="url"
                  placeholder="https://archive.org/download/..."
                  value={form.audio_url}
                  onChange={(e) => setForm({ ...form, audio_url: e.target.value })}
                  className="w-full p-2 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest font-mono"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-3 py-1.5 rounded-xl bg-surface-container-high text-on-surface-variant"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-primary text-on-primary font-bold"
              >
                حفظ السورة
              </button>
            </div>
          </form>
        )}

        <div className="p-5 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-surface-container-high">
            <span className="font-bold text-on-surface">
              سور القارئ الـ 114 مفهرسة ومربوطة في Neon Database
            </span>
            <span className="text-primary font-mono font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              114 / 114 سورة
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {Array.from({ length: 114 }, (_, i) => i + 1).map((sNum) => {
              const pad = String(sNum).padStart(3, '0');
              const url = `https://archive.org/download/ratil-${selectedReciterId}/${pad}.mp3`;
              return (
                <div
                  key={sNum}
                  className="p-2.5 rounded-xl bg-surface-container-high border border-surface-container-highest flex flex-col gap-1 text-[11px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-outline">#{sNum}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  <span
                    className="font-mono text-[10px] text-on-surface-variant truncate"
                    title={url}
                  >
                    {pad}.mp3
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
