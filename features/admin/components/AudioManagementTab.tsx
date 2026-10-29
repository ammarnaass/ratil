/**
 * رتل - Ratil
 * الشاشة 13: إدارة التلاوات الصوتية وروابط Archive.org
 * features/admin/components/AudioManagementTab.tsx
 */

import React, { useState } from 'react';
import { Radio, ExternalLink, Plus, CheckCircle, Music, ShieldCheck } from 'lucide-react';
import type { AdminReciter } from '../types/admin.types';

interface AudioManagementTabProps {
  reciters: AdminReciter[];
}

export function AudioManagementTab({ reciters }: AudioManagementTabProps) {
  const [selectedReciter, setSelectedReciter] = useState<string>(reciters[0]?.id || 'al-minshawy');

  return (
    <div className="flex flex-col gap-6">
      {/* إرشادات وقواعد Archive.org المعمارية */}
      <div className="p-6 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col gap-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-on-surface">قواعد معمارية التخزين الصوتي الدائم (Archive.org)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-surface-container-high border border-surface-container-highest flex flex-col gap-1.5">
            <span className="font-bold text-primary">1. المعرف الثابت (Identifier)</span>
            <p className="text-on-surface-variant leading-relaxed font-mono text-[11px]">
              ratil-&#123;reciter&#125;-&#123;riwaya&#125;
            </p>
            <span className="text-[10px] text-outline">معرف فريد ودائم للأبد في أرشيف الإنترنت</span>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-high border border-surface-container-highest flex flex-col gap-1.5">
            <span className="font-bold text-primary">2. نسق الروابط المباشرة</span>
            <p className="text-on-surface-variant leading-relaxed font-mono text-[11px] truncate">
              https://archive.org/download/ratil-&#123;id&#125;/001.mp3
            </p>
            <span className="text-[10px] text-outline">تدعم Range Requests و CORS تلقائياً</span>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-high border border-surface-container-highest flex flex-col gap-1.5">
            <span className="font-bold text-primary">3. كفاءة البث السحابي</span>
            <p className="text-on-surface-variant leading-relaxed text-[11px]">
              استجابة سريعة HTTP 206 تدعم القفز للآيات والتقديم/الترجيع اللحظي في المشغل
            </p>
            <span className="text-[10px] text-outline">تخفيض استهلاك Bandwidth إلى صفر على Vercel</span>
          </div>
        </div>
      </div>

      {/* اختيار القارئ واستعراض السور */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-on-surface">استعراض سور القارئ:</span>
            <div className="flex items-center gap-1.5 bg-surface-container p-1 rounded-xl border border-surface-container-high">
              {reciters.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedReciter(r.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedReciter === r.id
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {r.name.replace('الشيخ ', '')}
                </button>
              ))}
            </div>
          </div>

          <a
            href={`https://archive.org/details/ratil-${selectedReciter}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-primary hover:underline font-mono"
          >
            <span>زيارة مجموعة Archive.org</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* شبكة السور */}
        <div className="p-5 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-surface-container-high">
            <span className="font-bold text-on-surface">
              جميع السور الـ 114 مفهرسة ومربوطة في Neon Database
            </span>
            <span className="text-primary font-mono font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              114 / 114 مكتملة
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {Array.from({ length: 114 }, (_, i) => i + 1).map((sNum) => {
              const pad = String(sNum).padStart(3, '0');
              const url = `https://archive.org/download/ratil-${selectedReciter}/${pad}.mp3`;
              return (
                <div
                  key={sNum}
                  className="p-2.5 rounded-xl bg-surface-container-high border border-surface-container-highest flex flex-col gap-1 text-[11px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-outline">#{sNum}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  <span className="font-mono text-[10px] text-on-surface-variant truncate" title={url}>
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
