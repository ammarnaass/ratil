'use client';

/**
 * رتل - Ratil
 * تبويب إدارة الصوتيات وقواعد وتدفق Archive.org
 * features/admin/components/AudioTab.tsx
 */

import React, { useState, useEffect, useMemo } from 'react';
import type { Reciter } from '@/lib/types';
import type { AudioFormData, ReciterFormData } from '../types/admin.types';
import { extractArchiveItemId, ArchiveEmbedPreview } from '@/features/audio';
import surahsRaw from '@/data/surahs.json';
import { ArchiveRulesCard } from './ArchiveRulesCard';
import { AudioToolbar } from './AudioToolbar';
import { SurahCardItem } from './SurahCardItem';
import { SurahQuickEditModal } from './SurahQuickEditModal';
import { BulkSeedModal } from './BulkSeedModal';

export interface AudioTabProps {
  reciters: Reciter[];
  selectedReciterId: string;
  setSelectedReciterId: (id: string) => void;
  showAdd: boolean;
  setShowAdd: (show: boolean) => void;
  form: AudioFormData;
  setForm: React.Dispatch<React.SetStateAction<AudioFormData>>;
  onSave: (data?: any) => Promise<void> | void;
  onSeedSurahs?: (reciterId: string, itemId?: string) => Promise<void> | void;
  onUpdateReciter?: (id: string, data: Partial<ReciterFormData>) => Promise<void> | void;
}

export function AudioTab({
  reciters,
  selectedReciterId,
  setSelectedReciterId,
  onSave,
  onSeedSurahs,
  onUpdateReciter,
}: AudioTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activePreviewSurah, setActivePreviewSurah] = useState<number | null>(null);
  const [editingSurah, setEditingSurah] = useState<{ number: number; name: string } | null>(null);
  const [isBulkSeedOpen, setIsBulkSeedOpen] = useState(false);
  const [customAudioMap, setCustomAudioMap] = useState<Record<number, string>>({});

  const selectedReciter = reciters.find((r) => r.id === selectedReciterId);
  const archiveId = extractArchiveItemId(selectedReciter?.source_url, selectedReciterId);

  // جلب روابط السور المسجلة فعلياً في قاعدة البيانات للقارئ
  useEffect(() => {
    let isCancelled = false;
    async function loadAudio() {
      if (!selectedReciterId) return;
      try {
        const res = await fetch(`/api/audio?reciter_id=${selectedReciterId}`);
        if (res.ok) {
          const list: any[] = await res.json();
          if (!isCancelled && Array.isArray(list)) {
            const map: Record<number, string> = {};
            list.forEach((item) => {
              map[item.surah_number] = item.audio_url;
            });
            setCustomAudioMap(map);
          }
        }
      } catch {}
    }
    loadAudio();
    return () => { isCancelled = true; };
  }, [selectedReciterId]);

  const surahs = useMemo(() => {
    return (surahsRaw as any[]).map((s) => ({
      id: Number(s.id),
      name: s.ar || s.name_ar || `سورة #${s.id}`,
      ayahs: s.ayahs || 0,
    }));
  }, []);

  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return surahs;
    const q = searchQuery.trim().toLowerCase();
    return surahs.filter(
      (s) => s.name.includes(q) || String(s.id).includes(q)
    );
  }, [surahs, searchQuery]);

  const handleUpdateSourceUrl = async (newUrl: string) => {
    if (onUpdateReciter && selectedReciter) {
      await onUpdateReciter(selectedReciter.id, { source_url: newUrl });
    }
  };

  const handleModalSave = async (data: AudioFormData) => {
    await onSave(data);
    setCustomAudioMap((prev) => ({ ...prev, [data.surah_number]: data.audio_url }));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. بطاقة القواعد وتحديث المعرف */}
      <ArchiveRulesCard
        selectedReciter={selectedReciter}
        archiveId={archiveId}
        onUpdateSourceUrl={handleUpdateSourceUrl}
      />

      {/* 2. شريط الأدوات والبحث والقرّاء */}
      <AudioToolbar
        reciters={reciters}
        selectedReciterId={selectedReciterId}
        setSelectedReciterId={(id) => {
          setSelectedReciterId(id);
          setActivePreviewSurah(null);
        }}
        onOpenBulkSeed={() => setIsBulkSeedOpen(true)}
        onOpenAddSurah={() => setEditingSurah({ number: 1, name: 'الفاتحة' })}
        archiveId={archiveId}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalSurahs={114}
        customCount={Object.keys(customAudioMap).length}
      />

      {/* 3. مشغل المعاينة المباشرة إن وجد */}
      {activePreviewSurah && (
        <div className="p-4 rounded-2xl bg-surface-container border border-primary/30 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-primary">
              مشغل معاينة سورة {surahs.find((s) => s.id === activePreviewSurah)?.name} (#{activePreviewSurah})
            </span>
            <button
              onClick={() => setEditingSurah({
                number: activePreviewSurah,
                name: surahs.find((s) => s.id === activePreviewSurah)?.name || '',
              })}
              className="text-primary hover:underline text-[11px] font-bold"
            >
              تعديل رابط هذه السورة
            </button>
          </div>
          <ArchiveEmbedPreview
            embedUrl={`https://archive.org/embed/${archiveId}/${String(activePreviewSurah).padStart(3, '0')}.mp3`}
            detailsUrl={`https://archive.org/details/${archiveId}`}
            title={`مشغل التضمين لسورة #${activePreviewSurah}`}
          />
        </div>
      )}

      {/* 4. شبكة السور الـ 114 التفاعلية */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {filteredSurahs.map((surah) => {
          const pad = String(surah.id).padStart(3, '0');
          const audioUrl = customAudioMap[surah.id] || `https://archive.org/download/${archiveId}/${pad}.mp3`;
          const isActive = activePreviewSurah === surah.id;

          return (
            <SurahCardItem
              key={surah.id}
              surahNumber={surah.id}
              surahName={surah.name}
              pad={pad}
              audioUrl={audioUrl}
              isRegistered={Boolean(customAudioMap[surah.id])}
              isActivePreview={isActive}
              onTogglePreview={() => setActivePreviewSurah(isActive ? null : surah.id)}
              onOpenEdit={() => setEditingSurah({ number: surah.id, name: surah.name })}
            />
          );
        })}
      </div>

      {/* 5. النوافذ التفاعلية المنبثقة */}
      {editingSurah && (
        <SurahQuickEditModal
          isOpen={Boolean(editingSurah)}
          surahNumber={editingSurah.number}
          surahName={editingSurah.name}
          reciterId={selectedReciterId}
          reciterName={selectedReciter?.name || selectedReciterId}
          archiveId={archiveId}
          currentUrl={customAudioMap[editingSurah.number] || ''}
          onClose={() => setEditingSurah(null)}
          onSave={handleModalSave}
        />
      )}

      {isBulkSeedOpen && (
        <BulkSeedModal
          isOpen={isBulkSeedOpen}
          onClose={() => setIsBulkSeedOpen(false)}
          reciterId={selectedReciterId}
          reciterName={selectedReciter?.name || selectedReciterId}
          defaultArchiveId={archiveId}
          onSeed={async (rId, itmId) => {
            if (onSeedSurahs) {
              await onSeedSurahs(rId, itmId);
            }
          }}
        />
      )}
    </div>
  );
}

export default AudioTab;
