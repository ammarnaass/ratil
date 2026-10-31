'use client';

/**
 * رتل - Ratil
 * نافذة بذر وتوليد كافة سور المصحف (114 سورة) في Neon Database
 * features/admin/components/BulkSeedModal.tsx
 */

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Play, CheckCircle } from 'lucide-react';
import { parseArchiveAudioInput, buildSurahDirectUrl } from '@/features/audio';

export interface BulkSeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  reciterId: string;
  reciterName: string;
  defaultArchiveId: string;
  onSeed: (reciterId: string, itemId: string) => Promise<void> | void;
}

export function BulkSeedModal({
  isOpen,
  onClose,
  reciterId,
  reciterName,
  defaultArchiveId,
  onSeed,
}: BulkSeedModalProps) {
  const [itemId, setItemId] = useState(defaultArchiveId);
  const [isSeeding, setIsSeeding] = useState(false);
  const [testPlaying, setTestPlaying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setItemId(defaultArchiveId || `ratil-${reciterId}`);
      setTestPlaying(false);
    }
  }, [isOpen, defaultArchiveId, reciterId]);

  if (!isOpen) return null;

  const parsed = parseArchiveAudioInput(itemId);
  const effectiveItemId = parsed.isValid && parsed.itemId ? parsed.itemId : itemId.trim();
  const sampleFatihah = buildSurahDirectUrl(effectiveItemId, 1);
  const sampleNas = buildSurahDirectUrl(effectiveItemId, 114);

  const handleConfirmSeed = async () => {
    if (!effectiveItemId) return;
    setIsSeeding(true);
    try {
      await onSeed(reciterId, effectiveItemId);
      onClose();
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-surface-container border border-surface-container-high rounded-3xl max-w-lg w-full p-6 flex flex-col gap-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">بذر سور المصحف (114 سورة)</h3>
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

        <div className="flex flex-col gap-4 text-xs">
          <div>
            <label className="text-on-surface-variant font-bold block mb-1">
              معرف مجموعة Archive.org (Item ID) أو رابط المجموعة:
            </label>
            <input
              type="text"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              placeholder="مثال: 483568356837_gmail_001 أو al-minshawy-hafs"
              className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest font-mono text-xs focus:ring-1 focus:ring-primary outline-hidden"
              required
            />
            <span className="text-[10px] text-outline mt-1 block">
              سيتم توليد روابط الـ 114 سورة كاملة بنسق الترقيم المعياري (001.mp3 إلى 114.mp3).
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-high/60 border border-surface-container-highest flex flex-col gap-2">
            <span className="font-bold text-primary text-[11px] flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>معاينة روابط التدفق الناتجة:</span>
            </span>
            <div className="flex flex-col gap-1.5 font-mono text-[10px] text-on-surface-variant">
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container border border-surface-container-highest">
                <span className="truncate max-w-[320px]">الفاتحة (#1): {sampleFatihah}</span>
                <button
                  type="button"
                  onClick={() => setTestPlaying(!testPlaying)}
                  className="px-2 py-0.5 rounded-md bg-primary text-on-primary font-sans font-bold flex items-center gap-1 text-[10px]"
                >
                  <Play className="w-2.5 h-2.5" />
                  <span>{testPlaying ? 'إيقاف' : 'تجربة'}</span>
                </button>
              </div>
              <div className="p-2 rounded-lg bg-surface-container border border-surface-container-highest truncate">
                الناس (#114): {sampleNas}
              </div>
            </div>

            {testPlaying && (
              <audio src={sampleFatihah} controls autoPlay className="w-full h-8 mt-1" />
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-high">
            <button
              type="button"
              onClick={onClose}
              disabled={isSeeding}
              className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-on-surface"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleConfirmSeed}
              disabled={isSeeding || !effectiveItemId}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
            >
              {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>تأكيد بذر 114 سورة في Neon</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkSeedModal;
