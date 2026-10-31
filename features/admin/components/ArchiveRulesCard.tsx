'use client';

/**
 * رتل - Ratil
 * بطاقة قواعد معمارية التخزين الصوتي وتحديث معرف الأرشيف للقارئ
 * features/admin/components/ArchiveRulesCard.tsx
 */

import React, { useState } from 'react';
import { Radio, ExternalLink, Edit3, Check, X, Loader2 } from 'lucide-react';
import type { Reciter } from '@/lib/types';
import { parseArchiveAudioInput } from '@/features/audio';

export interface ArchiveRulesCardProps {
  selectedReciter?: Reciter;
  archiveId: string;
  onUpdateSourceUrl: (newSourceUrl: string) => Promise<void> | void;
}

export function ArchiveRulesCard({
  selectedReciter,
  archiveId,
  onUpdateSourceUrl,
}: ArchiveRulesCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = () => {
    setInputVal(selectedReciter?.source_url || archiveId || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!inputVal.trim()) return;
    setIsSaving(true);
    try {
      const parsed = parseArchiveAudioInput(inputVal.trim());
      const newUrl = parsed.isValid && parsed.detailsUrl
        ? parsed.detailsUrl
        : `https://archive.org/details/${inputVal.trim()}`;
      await onUpdateSourceUrl(newUrl);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col gap-4 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-on-surface">
            قواعد معمارية التخزين الصوتي وتطبيع Archive.org
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold">
            دعم تلقائي لـ Iframe & EMBED & Direct MP3
          </span>
          <button
            onClick={isEditing ? () => setIsEditing(false) : startEdit}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-semibold text-on-surface transition-all border border-surface-container-highest"
          >
            {isEditing ? <X className="w-3.5 h-3.5 text-error" /> : <Edit3 className="w-3.5 h-3.5 text-primary" />}
            <span>{isEditing ? 'إلغاء' : 'تحديث معرف الأرشيف'}</span>
          </button>
        </div>
      </div>

      {/* نموذج تعديل معرف الأرشيف المباشر */}
      {isEditing && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-primary">
              تحديث معرف مجموعة Archive.org للقارئ ({selectedReciter?.name})
            </span>
            <span className="text-[11px] text-on-surface-variant">
              يمكنك إدخال المعرف المباشر (مثل: 483568356837_gmail_001 أو al-minshawy-hafs) أو رابط المجموعة كاملاً:
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="مثال: 483568356837_gmail_001 أو https://archive.org/details/..."
              className="flex-1 min-w-[240px] p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest font-mono text-xs"
            />
            <button
              onClick={handleSave}
              disabled={isSaving || !inputVal.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>حفظ وتحديث في Neon</span>
            </button>
          </div>
        </div>
      )}

      {/* بطاقات المعمارية الثلاث */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-surface-container-high border border-surface-container-highest flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-primary">1. المعرف الثابت (Item ID)</span>
            <a
              href={`https://archive.org/details/${archiveId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:opacity-80"
              title="فتح في Archive.org"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="text-on-surface-variant leading-relaxed font-mono text-[11px] truncate" title={archiveId}>
            {archiveId || `ratil-${selectedReciter?.id}`}
          </p>
          <span className="text-[10px] text-outline">المعرف الدائم للمجموعة في الأرشيف</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-high border border-surface-container-highest flex flex-col gap-1.5">
          <span className="font-bold text-primary">2. نسق الروابط المباشرة</span>
          <p className="text-on-surface-variant leading-relaxed font-mono text-[11px] truncate">
            https://archive.org/download/{archiveId || `{id}`}/001.mp3
          </p>
          <span className="text-[10px] text-outline">تدعم Range Requests وتزامن الآيات والكاش</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-high border border-surface-container-highest flex flex-col gap-1.5">
          <span className="font-bold text-primary">3. كود التضمين ووسم الوصف</span>
          <p className="text-on-surface-variant leading-relaxed text-[11px] font-mono truncate">
            &lt;iframe src=".../embed/..."&gt; أو [archiveorg ...]
          </p>
          <span className="text-[10px] text-outline">يتم تطبيعها واستخراج الرابط الصوتي آلياً</span>
        </div>
      </div>
    </div>
  );
}

export default ArchiveRulesCard;
