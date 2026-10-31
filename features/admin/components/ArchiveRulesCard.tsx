'use client';

/**
 * رتل - Ratil
 * بطاقة قواعد معمارية التخزين الصوتي وتحديث معرف الأرشيف للقارئ
 * features/admin/components/ArchiveRulesCard.tsx
 */

import React, { useState } from 'react';
import { Radio, ExternalLink, Edit3, Check, X, Loader2, Copy, ChevronDown, ChevronUp, Sparkles, Layers } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const startEdit = () => {
    setInputVal(selectedReciter?.source_url || archiveId || '');
    setIsEditing(true);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
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

  const downloadSample = `https://archive.org/download/${archiveId || '{item_id}'}/001.mp3`;

  return (
    <div className="rounded-3xl bg-surface-container border border-surface-container-high/80 overflow-hidden shadow-xs transition-all">
      {/* 1. الترويسة الرئيسية مع المحاذاة والمسافات المتوازنة */}
      <div className="p-4 sm:p-5 flex items-center justify-between flex-wrap gap-3.5 bg-gradient-to-l from-primary/5 via-transparent to-transparent">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-xs">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-on-surface truncate">
                معمارية وتدفق السور (Archive.org)
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold border border-primary/20 shrink-0">
                تطبيع تلقائي
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-on-surface-variant">
              <span>المعرف النشط:</span>
              <code className="px-2 py-0.5 rounded-lg bg-surface-container-high font-mono text-[11px] text-primary font-bold truncate max-w-[200px]" dir="ltr">
                {archiveId || 'غير محدد'}
              </code>
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات في الرأس */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-9 flex items-center gap-1.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs text-on-surface font-semibold border border-surface-container-highest transition-all"
            title={isExpanded ? 'طي القواعد' : 'عرض القواعد المعمارية'}
          >
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">القواعد المعمارية</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={isEditing ? () => setIsEditing(false) : startEdit}
            className="h-9 flex items-center gap-1.5 px-3.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-xs font-bold text-primary border border-primary/30 transition-all shadow-xs"
          >
            {isEditing ? <X className="w-3.5 h-3.5 text-error" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{isEditing ? 'إلغاء' : 'تحديث معرف الأرشيف'}</span>
          </button>
        </div>
      </div>

      {/* 2. نموذج تعديل معرف الأرشيف المباشر */}
      {isEditing && (
        <div className="p-4 mx-4 mb-4 rounded-2xl bg-surface-container-high/60 border border-primary/30 flex flex-col gap-3 transition-all animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              تحديث معرف مجموعة Archive.org للقارئ ({selectedReciter?.name})
            </span>
            <span className="text-[11px] text-on-surface-variant">حفظ فوري في قاعدة البيانات</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="مثال: ratil-al-minshawy-hafs أو https://archive.org/details/..."
              className="flex-1 min-w-[260px] h-10 px-3.5 rounded-xl bg-surface-container text-on-surface border border-surface-container-highest font-mono text-xs focus:ring-1 focus:ring-primary outline-hidden"
            />
            <button
              onClick={handleSave}
              disabled={isSaving || !inputVal.trim()}
              className="h-10 flex items-center gap-1.5 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>حفظ التحديث</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. لوحة القواعد المعمارية التفصيلية المنظمة */}
      {isExpanded && (
        <div className="p-4 sm:p-5 pt-0 border-t border-surface-container-high/60 grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs animate-fadeIn">
          {/* القاعدة 1 */}
          <div className="p-3.5 rounded-2xl bg-surface-container-high/40 border border-surface-container-highest/80 flex flex-col justify-between gap-2.5 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold">1</span>
                المعرف الثابت (Item ID)
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopy(archiveId, 'itemId')}
                  className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
                  title="نسخ المعرف"
                >
                  {copiedKey === 'itemId' ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={`https://archive.org/details/${archiveId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-surface-container text-primary"
                  title="فتح في Archive.org"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
            <code className="text-on-surface-variant bg-surface-container px-2.5 py-1.5 rounded-xl font-mono text-[11px] truncate block" dir="ltr">
              {archiveId || 'غير محدد'}
            </code>
            <span className="text-[10px] text-outline">المعرف الدائم للمجموعة في السحابة</span>
          </div>

          {/* القاعدة 2 */}
          <div className="p-3.5 rounded-2xl bg-surface-container-high/40 border border-surface-container-highest/80 flex flex-col justify-between gap-2.5 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold">2</span>
                الروابط المباشرة (Direct MP3)
              </span>
              <button
                onClick={() => handleCopy(downloadSample, 'downloadUrl')}
                className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
                title="نسخ نسق الرابط"
              >
                {copiedKey === 'downloadUrl' ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <code className="text-on-surface-variant bg-surface-container px-2.5 py-1.5 rounded-xl font-mono text-[11px] truncate block" dir="ltr" title={downloadSample}>
              {downloadSample}
            </code>
            <span className="text-[10px] text-outline">تدعم البث المباشر (Range Requests)</span>
          </div>

          {/* القاعدة 3 */}
          <div className="p-3.5 rounded-2xl bg-surface-container-high/40 border border-surface-container-highest/80 flex flex-col justify-between gap-2.5 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold">3</span>
                التضمين (Iframe / Embed)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">تلقائي</span>
            </div>
            <code className="text-on-surface-variant bg-surface-container px-2.5 py-1.5 rounded-xl font-mono text-[11px] truncate block" dir="ltr">
              &lt;iframe src=".../embed/..."&gt;
            </code>
            <span className="text-[10px] text-outline">استخراج الرابط الصوتي وتطهيره آلياً</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArchiveRulesCard;
