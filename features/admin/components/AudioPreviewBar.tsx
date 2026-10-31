'use client';

/**
 * رتل - Ratil
 * شريط المعاينة الصوتية العائم المتناسق أسفل لوحة التحكم
 * features/admin/components/AudioPreviewBar.tsx
 */

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, X, Edit3, Volume2, VolumeX, ExternalLink, Music2 } from 'lucide-react';

export interface AudioPreviewBarProps {
  surahNumber: number;
  surahName: string;
  reciterName: string;
  audioUrl: string;
  archiveId: string;
  onClose: () => void;
  onEdit: () => void;
}

export function AudioPreviewBar({
  surahNumber,
  surahName,
  reciterName,
  audioUrl,
  archiveId,
  onClose,
  onEdit,
}: AudioPreviewBarProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsPlaying(true);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <aside aria-label="شريط المعاينة الصوتية" className="fixed bottom-3 sm:bottom-4 left-3 right-3 sm:left-4 sm:right-4 z-50 max-w-4xl mx-auto animate-slideUp">
      <div className="p-2.5 sm:p-3.5 rounded-3xl bg-surface-container/95 backdrop-blur-xl border border-primary/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3 text-on-surface">
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          muted={isMuted}
        />

        {/* 1. معلومات السورة والقارئ */}
        <div className="flex items-center gap-2.5 w-full md:w-auto min-w-0">
          <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/30">
            <Music2 className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm text-on-surface truncate">
                سورة {surahName} (#{surahNumber})
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-bold shrink-0">
                بث مباشر
              </span>
            </div>
            <span className="text-[11px] text-on-surface-variant truncate">
              {reciterName}
            </span>
          </div>
        </div>

        {/* 2. شريط التحكم بالتشغيل والزمن */}
        <div className="flex-1 w-full max-w-md flex items-center gap-2 sm:gap-3">
          <button
            onClick={togglePlay}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-xs hover:opacity-90 transition-all select-none"
            title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-[-1px]" />}
          </button>

          <span className="text-[10px] sm:text-[11px] font-mono text-outline shrink-0">
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
          />

          <span className="text-[10px] sm:text-[11px] font-mono text-outline shrink-0">
            {formatTime(duration)}
          </span>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
            title={isMuted ? 'إلغاء الكتم' : 'كتم'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-error" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* 3. أزرار الإجراءات السريعة والإغلاق */}
        <div className="flex items-center justify-end gap-1.5 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-surface-container-high">
          <button
            onClick={onEdit}
            className="h-8 flex items-center gap-1.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-bold text-primary border border-surface-container-highest transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>تعديل</span>
          </button>

          <a
            href={`https://archive.org/details/${archiveId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-xl hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
            title="فتح في Archive.org"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-surface-container-high text-on-surface-variant hover:text-error transition-colors"
            title="إغلاق المعاينة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AudioPreviewBar;
