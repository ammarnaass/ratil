'use client';

/**
 * رتل - Ratil
 * شريط المعاينة الصوتية العائم أسفل لوحة التحكم
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
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    setIsPlaying(true);
    setCurrentTime(0);
    setAudioError(false);
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
      audioRef.current.play().catch(() => setAudioError(true));
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
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-4xl mx-auto animate-slideUp">
      <div className="p-3.5 sm:p-4 rounded-3xl bg-surface-container/95 backdrop-blur-xl border border-primary/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-on-surface">
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onError={() => setAudioError(true)}
          muted={isMuted}
        />

        {/* معلومات السورة والقارئ */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/30">
            <Music2 className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-on-surface truncate">
                سورة {surahName} (#{surahNumber})
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                معاينة مباشرة
              </span>
            </div>
            <span className="text-xs text-on-surface-variant truncate">
              {reciterName}
            </span>
          </div>
        </div>

        {/* شريط التحكم بالتشغيل والزمن */}
        <div className="flex-1 w-full max-w-md flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-2xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-md hover:opacity-90 transition-all"
            title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 translate-x-[-1px]" />}
          </button>

          <span className="text-[11px] font-mono text-outline shrink-0">
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

          <span className="text-[11px] font-mono text-outline shrink-0">
            {formatTime(duration)}
          </span>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
            title={isMuted ? 'إلغاء الكتم' : 'كتم'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-error" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* أزرار الإجراءات السريعة والإغلاق */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-bold text-primary border border-surface-container-highest transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>تعديل الرابط</span>
          </button>

          <a
            href={`https://archive.org/details/${archiveId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
            title="فتح في Archive.org"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surface-container-high text-on-surface-variant hover:text-error transition-colors"
            title="إغلاق المعاينة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AudioPreviewBar;
