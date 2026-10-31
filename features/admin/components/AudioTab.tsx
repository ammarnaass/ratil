'use client';

/**
 * رتل - Ratil
 * تبويب إدارة الصوتيات وقواعد وتدفق Archive.org
 * features/admin/components/AudioTab.tsx
 */

import React, { useState, useMemo } from 'react';
import type { Reciter } from '@/lib/types';
import type { AudioFormData, ReciterFormData } from '../types/admin.types';
import { extractArchiveItemId } from '@/features/audio';
import surahsRaw from '@/data/surahs.json';
import { ArchiveRulesCard } from './ArchiveRulesCard';
import { AudioToolbar, type SurahFilterType } from './AudioToolbar';
import { SurahCardItem } from './SurahCardItem';
import { SurahRowItem } from './SurahRowItem';
import { AudioPreviewBar } from './AudioPreviewBar';
import { SurahQuickEditModal } from './SurahQuickEditModal';
import { BulkSeedModal } from './BulkSeedModal';
import { useReciterAudioMap } from '../hooks/useReciterAudioMap';

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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterType, setFilterType] = useState<SurahFilterType>('all');
  const [activePreviewSurah, setActivePreviewSurah] = useState<number | null>(null);
  const [editingSurah, setEditingSurah] = useState<{ number: number; name: string } | null>(null);
  const [isBulkSeedOpen, setIsBulkSeedOpen] = useState(false);

  const selectedReciter = reciters.find((r) => r.id === selectedReciterId);
  const archiveId = extractArchiveItemId(selectedReciter?.source_url, selectedReciterId);
  const { customAudioMap, updateSurahUrl } = useReciterAudioMap(selectedReciterId);

  const surahs = useMemo(() => {
    return (surahsRaw as any[]).map((s) => ({
      id: Number(s.id),
      name: s.ar || s.name_ar || `سورة #${s.id}`,
      type: s.type || 'مكية',
      ayahs: s.ayahs || 0,
    }));
  }, []);

  const filteredSurahs = useMemo(() => {
    let list = surahs;
    if (filterType === 'meccan') list = list.filter((s) => s.type === 'مكية');
    else if (filterType === 'medinan') list = list.filter((s) => s.type === 'مدنية');
    else if (filterType === 'neon') list = list.filter((s) => Boolean(customAudioMap[s.id]));

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((s) => s.name.includes(q) || String(s.id).includes(q));
    }
    return list;
  }, [surahs, filterType, searchQuery, customAudioMap]);

  const activeSurahObj = surahs.find((s) => s.id === activePreviewSurah);
  const activePad = activePreviewSurah ? String(activePreviewSurah).padStart(3, '0') : '001';
  const activeAudioUrl = activePreviewSurah
    ? customAudioMap[activePreviewSurah] || `https://archive.org/download/${archiveId}/${activePad}.mp3`
    : '';

  return (
    <div className="flex flex-col gap-5 pb-20">
      {/* 1. بطاقة القواعد المعمارية المصقولة */}
      <ArchiveRulesCard
        selectedReciter={selectedReciter}
        archiveId={archiveId}
        onUpdateSourceUrl={async (newUrl) => {
          if (onUpdateReciter && selectedReciter) {
            await onUpdateReciter(selectedReciter.id, { source_url: newUrl });
          }
        }}
      />

      {/* 2. شريط الأدوات والفلاتر ونمط العرض */}
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
        viewMode={viewMode}
        setViewMode={setViewMode}
        filterType={filterType}
        setFilterType={setFilterType}
        totalSurahs={114}
        customCount={Object.keys(customAudioMap).length}
      />

      {/* 3. شبكة البطاقات أو جدول السور */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredSurahs.map((surah) => {
            const pad = String(surah.id).padStart(3, '0');
            const audioUrl = customAudioMap[surah.id] || `https://archive.org/download/${archiveId}/${pad}.mp3`;
            return (
              <SurahCardItem
                key={surah.id}
                surahNumber={surah.id}
                surahName={surah.name}
                surahType={surah.type}
                ayahs={surah.ayahs}
                pad={pad}
                audioUrl={audioUrl}
                isRegistered={Boolean(customAudioMap[surah.id])}
                isActivePreview={activePreviewSurah === surah.id}
                onTogglePreview={() => setActivePreviewSurah(activePreviewSurah === surah.id ? null : surah.id)}
                onOpenEdit={() => setEditingSurah({ number: surah.id, name: surah.name })}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-surface-container-high/80 bg-surface-container overflow-hidden shadow-xs">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-surface-container-high text-on-surface-variant text-[11px] font-bold bg-surface-container-high/40">
                <th className="py-3 px-3 text-center w-12">#</th>
                <th className="py-3 px-3">السورة</th>
                <th className="py-3 px-3 hidden sm:table-cell">اسم الملف والرابط</th>
                <th className="py-3 px-3 text-center hidden md:table-cell">المصدر</th>
                <th className="py-3 px-3 text-left w-28">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredSurahs.map((surah) => {
                const pad = String(surah.id).padStart(3, '0');
                const audioUrl = customAudioMap[surah.id] || `https://archive.org/download/${archiveId}/${pad}.mp3`;
                return (
                  <SurahRowItem
                    key={surah.id}
                    surahNumber={surah.id}
                    surahName={surah.name}
                    surahType={surah.type}
                    ayahs={surah.ayahs}
                    pad={pad}
                    audioUrl={audioUrl}
                    isRegistered={Boolean(customAudioMap[surah.id])}
                    isActivePreview={activePreviewSurah === surah.id}
                    onTogglePreview={() => setActivePreviewSurah(activePreviewSurah === surah.id ? null : surah.id)}
                    onOpenEdit={() => setEditingSurah({ number: surah.id, name: surah.name })}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. شريط المعاينة الصوتية العائم */}
      {activePreviewSurah && activeSurahObj && (
        <AudioPreviewBar
          surahNumber={activePreviewSurah}
          surahName={activeSurahObj.name}
          reciterName={selectedReciter?.name || selectedReciterId}
          audioUrl={activeAudioUrl}
          archiveId={archiveId}
          onClose={() => setActivePreviewSurah(null)}
          onEdit={() => setEditingSurah({ number: activePreviewSurah, name: activeSurahObj.name })}
        />
      )}

      {/* 5. النوافذ المنبثقة */}
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
          onSave={async (data) => {
            await onSave(data);
            updateSurahUrl(data.surah_number, data.audio_url);
          }}
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
            if (onSeedSurahs) await onSeedSurahs(rId, itmId);
          }}
        />
      )}
    </div>
  );
}

export default AudioTab;
