'use client';

/**
 * رتل - Ratil
 * مكون معاينة مشغل التضمين الرسمي من Archive.org (Iframe Embed)
 * features/audio/components/ArchiveEmbedPreview.tsx
 */

import React from 'react';
import { ExternalLink, Radio } from 'lucide-react';

export interface ArchiveEmbedPreviewProps {
  embedUrl: string;
  detailsUrl?: string;
  title?: string;
  className?: string;
}

export function ArchiveEmbedPreview({
  embedUrl,
  detailsUrl,
  title = 'معاينة مشغل التضمين الرسمي من Archive.org',
  className = '',
}: ArchiveEmbedPreviewProps) {
  if (!embedUrl) return null;

  return (
    <div className={`p-3 rounded-xl bg-surface-container-high border border-surface-container-highest flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-on-surface flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-primary" />
          <span>{title}</span>
        </span>
        {detailsUrl && (
          <a
            href={detailsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-primary hover:underline"
          >
            <span>صفحة الأرشيف</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      <div className="w-full rounded-lg overflow-hidden border border-surface-container-highest/60 bg-black/40">
        <iframe
          src={embedUrl}
          width="100%"
          height="38"
          frameBorder="0"
          allowFullScreen
          title={title}
          className="w-full"
        />
      </div>
    </div>
  );
}

export default ArchiveEmbedPreview;
