'use client';

/**
 * رتل - Ratil
 * نافذة التعديل السريع والاختبار المباشر لسورة محددة
 * features/admin/components/SurahQuickEditModal.tsx
 */

import React, { useState, useEffect } from 'react';
import { X, Check, RotateCcw, Volume2, Loader2, Sparkles } from 'lucide-react';
import {
  parseArchiveAudioInput,
  buildSurahDirectUrl,
  ArchiveEmbedPreview,
} from '@/features/audio';
import type { AudioFormData } from '../types/admin.types';

export interface SurahQuickEditModalProps {
  isOpen: boolean;
  surahNumber: number;
  surahName: string;
  reciterId: string;
  reciterName: string;
  archiveId: string;
  currentUrl?: string;
  onClose: () => void;
  onSave: (data: AudioFormData) => Promise<void> | void;
}

export function SurahQuickEditModal({
  isOpen,
  surahNumber,
  surahName,
  reciterId,
  reciterName,
  archiveId,
  currentUrl = '',
  onClose,
  onSave,
}: SurahQuickEditModalProps) {
  const [inputVal, setInputVal] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setInputVal(currentUrl || buildSurahDirectUrl(archiveId, surahNumber));
    }
  }, [isOpen, currentUrl, archiveId, surahNumber]);

  if (!isOpen) return null;

  const parsed = parseArchiveAudioInput(inputVal);
  const effectiveAudioUrl = parsed.isValid && parsed.downloadUrl ? parsed.downloadUrl : inputVal;

  const handleResetStandard = () => {
    const standard = buildSurahDirectUrl(archiveId, surahNumber);
    setInputVal(standard);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveAudioUrl.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        reciter_id: reciterId,
        surah_number: surahNumber,
        audio_url: effectiveAudioUrl.trim(),
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-surface-container border border-surface-container-high rounded-3xl max-w-lg w-full p-6 flex flex-col gap-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold font-mono text-sm">
              #{surahNumber}
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">سورة {surahName}</h3>
              <p className="text-[11px] text-on-surface-variant">القارئ: {reciterName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-on-surface-variant font-bold">
                رابط السورة / كود التضمين Iframe أو EMBED:
              </label>
              <button
                type="button"
                onClick={handleResetStandard}
                className="text-[11px] text-primary hover:underline flex items-center gap-1 font-sans"
              >
                <RotateCcw className="w-3 h-3" />
                <span>الرابط القياسي للأرشيف</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="الصق الرابط المباشر، أو كود iframe، أو وسم [archiveorg ...]"
              className="w-full p-3 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest font-mono text-xs focus:ring-1 focus:ring-primary outline-hidden"
              required
            />
          </div>

          {/* معاينة الرابط المستخرج */}
          <div className="p-3 rounded-xl bg-surface-container-high/60 border border-surface-container-highest flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-primary flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" />
                <span>الرابط المعتمد بعد التطبيع:</span>
              </span>
              <span className="font-mono text-outline text-[10px]">
                {parsed.itemId || archiveId}
              </span>
            </div>
            <p className="font-mono text-[10px] text-on-surface-variant truncate bg-surface-container p-2 rounded-lg border border-surface-container-highest" title={effectiveAudioUrl}>
              {effectiveAudioUrl}
            </p>

            {/* مشغل التضمين والمعاينة السريعة */}
            <ArchiveEmbedPreview
              embedUrl={parsed.embedUrl || `https://archive.org/embed/${archiveId}/${String(surahNumber).padStart(3, '0')}.mp3`}
              detailsUrl={parsed.detailsUrl || `https://archive.org/details/${archiveId}`}
              title={`مشغل سورة ${surahName} للاختبار المباشر`}
            />
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
              disabled={isSaving || !effectiveAudioUrl.trim()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>حفظ وتثبيت في Neon</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SurahQuickEditModal;
