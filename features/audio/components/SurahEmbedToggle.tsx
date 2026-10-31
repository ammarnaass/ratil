'use client';

/**
 * رتل - Ratil
 * زر قابل للطي لعرض مشغل التضمين الرسمي لـ Archive.org
 * features/audio/components/SurahEmbedToggle.tsx
 */

import React, { useState } from 'react';
import { Radio, ChevronDown, ChevronUp } from 'lucide-react';
import ArchiveEmbedPreview from './ArchiveEmbedPreview';

export interface SurahEmbedToggleProps {
  embedUrl: string;
  detailsUrl?: string;
  surahName: string;
}

export function SurahEmbedToggle({
  embedUrl,
  detailsUrl,
  surahName,
}: SurahEmbedToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full rounded-2xl bg-surface-container/60 border border-surface-container-high/60 overflow-hidden text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <span className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-primary" />
          <span>مشغل التضمين التوثيقي من Archive.org (سورة {surahName})</span>
        </span>
        <div className="flex items-center gap-1 text-[11px] text-outline">
          <span>{isOpen ? 'إخفاء' : 'عرض المشغل الخارجي'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 border-t border-surface-container-high/60 bg-surface-container-lowest/40">
          <ArchiveEmbedPreview
            embedUrl={embedUrl}
            detailsUrl={detailsUrl}
            title={`مشغل Archive.org المباشر — سورة ${surahName}`}
          />
        </div>
      )}
    </div>
  );
}

export default SurahEmbedToggle;
