'use client';

/**
 * رتل - Ratil
 * مشغّل التلاوات الصوتي المتقن (Client Component)
 * components/Player.tsx
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  User,
  ListMusic,
  CheckCircle2,
} from 'lucide-react';
import type { Reciter } from '@/lib/types';
import { saveLastPlayed, getLastPlayed } from '@/lib/storage';
import { updateMediaSession, updateMediaPositionState } from '@/lib/media-session';
import OfflineButton from './OfflineButton';

interface PlayerProps {
  surahId: number;
  surahName: string;
  reciters: Reciter[];
  initialAyah?: number;
}

export default function Player({
  surahId,
  surahName,
  reciters,
  initialAyah = 1,
}: PlayerProps) {
  const [currentReciterId, setCurrentReciterId] = useState<string>(
    reciters[0]?.id || 'al-minshawy'
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showReciterMenu, setShowReciterMenu] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // حساب الرابط الصوتي المباشر من Archive.org
  const padSurah = String(surahId).padStart(3, '0');
  const currentReciter =
    reciters.find((r) => r.id === currentReciterId) || reciters[0] || {
      id: 'al-minshawy',
      name: 'الشيخ محمد صديق المنشاوي',
      riwaya: 'hafs',
    };

  // رابط Archive.org الثابت
  const audioUrl = `https://archive.org/download/ratil-${currentReciter.id}/${padSurah}.mp3`;

  // استعادة موضع الاستماع السابق إن وجد
  useEffect(() => {
    const last = getLastPlayed();
    if (last && last.surahId === surahId && last.currentTime && audioRef.current) {
      if (last.currentTime < (last.duration || 3600) - 10) {
        audioRef.current.currentTime = last.currentTime;
        setCurrentTime(last.currentTime);
      }
    }
  }, [surahId]);

  // تحديث MediaSession عند تغيير السورة أو القارئ
  useEffect(() => {
    updateMediaSession({
      surahName,
      reciterName: currentReciter.name,
      riwaya: currentReciter.riwaya === 'warsh' ? 'ورش عن نافع' : 'حفص عن عاصم',
      onPlay: () => handlePlay(),
      onPause: () => handlePause(),
      onSeek: (details) => {
        if (details.seekTime !== undefined && audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
        }
      },
    });
  }, [surahName, currentReciter, surahId]);

  const handlePlay = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => {
        console.warn('Audio playback start was prevented or waiting for user gesture:', e);
      });
    }
  }, []);

  const handlePause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime;
      setCurrentTime(cur);

      // حفظ موضع الاستماع للمستخدم
      saveLastPlayed({
        surahId,
        ayahNumber: initialAyah,
        reciterId: currentReciter.id,
        currentTime: cur,
        duration: audioRef.current.duration || duration,
        isPlaying: true,
      });

      updateMediaPositionState(audioRef.current.duration || duration, playbackRate, cur);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const skipSeconds = (sec: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(duration, audioRef.current.currentTime + sec)
      );
    }
  };

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 0.75];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '٠٠:٠٠';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const padM = String(m).padStart(2, '0');
    const padS = String(s).padStart(2, '0');
    return `${padM}:${padS}`;
  };

  const riwayaBadge =
    currentReciter.riwaya === 'warsh'
      ? 'ورش عن نافع'
      : currentReciter.riwaya === 'qalon'
      ? 'قالون عن نافع'
      : 'حفص عن عاصم';

  return (
    <>
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* شريط المشغل الثابت بالأسفل (Persistent Bottom Player) */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-surface-container-high shadow-2xl transition-all">
        {/* شريط التقدم الدقيق */}
        <div className="w-full h-1.5 bg-surface-container-high relative group cursor-pointer">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div
            className="h-full bg-primary relative transition-all"
            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-on-primary-container rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* معلومات السورة والقارئ */}
          <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-surface-container flex items-center justify-center text-primary border border-surface-container-high shrink-0">
                <ListMusic className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-on-surface truncate">
                    سورة {surahName}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                    {riwayaBadge}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant truncate">
                  <User className="w-3.5 h-3.5 text-outline shrink-0" />
                  <span className="truncate">{currentReciter.name}</span>
                </div>
              </div>
            </div>

            {/* زر القارئ على الجوال */}
            <button
              onClick={() => setShowReciterMenu(!showReciterMenu)}
              className="md:hidden p-2 rounded-xl bg-surface-container text-on-surface-variant text-xs"
              title="تغيير القارئ"
            >
              القرّاء
            </button>
          </div>

          {/* أزرار التحكم بالصوت */}
          <div className="flex flex-col items-center gap-1.5 w-full md:w-auto">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => skipSeconds(-10)}
                className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                title="تأخير 10 ثوانٍ"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-primary text-on-primary hover:bg-primary-focus flex items-center justify-center transition-all shadow-lg active:scale-95"
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current mr-0.5" />
                )}
              </button>

              <button
                onClick={() => skipSeconds(10)}
                className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                title="تقديم 10 ثوانٍ"
              >
                <RotateCw className="w-5 h-5" />
              </button>

              <button
                onClick={cycleSpeed}
                className="px-2.5 py-1 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors tabular-nums border border-surface-container-high"
                title="سرعة التلاوة"
              >
                {playbackRate}x
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-on-surface-variant tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* قائمة اختيار القارئ وزر الكاش دون إنترنت */}
          <div className="hidden md:flex items-center gap-3 relative">
            <OfflineButton
              audioUrl={audioUrl}
              surahId={surahId}
              surahName={surahName}
            />

            <div className="relative">
              <button
                onClick={() => setShowReciterMenu(!showReciterMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs text-on-surface border border-surface-container-high transition-colors"
              >
                <User className="w-3.5 h-3.5 text-primary" />
                <span className="truncate max-w-[140px]">{currentReciter.name}</span>
              </button>

              {showReciterMenu && (
                <div className="absolute left-0 bottom-full mb-2 w-72 bg-surface-container-low rounded-2xl p-2 border border-surface-container-high shadow-2xl z-50 flex flex-col gap-1">
                  <div className="text-[11px] font-semibold text-outline px-3 py-1">
                    اختر القارئ المعتمد
                  </div>
                  {reciters.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setCurrentReciterId(r.id);
                        setShowReciterMenu(false);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-right text-xs transition-colors ${
                        r.id === currentReciter.id
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'hover:bg-surface-container text-on-surface'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{r.name}</span>
                        <span className="text-[10px] text-on-surface-variant font-normal">
                          {r.riwaya === 'warsh' ? 'ورش عن نافع' : 'حفص عن عاصم'}
                        </span>
                      </div>
                      {r.id === currentReciter.id && (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleMute}
              className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface transition-colors"
              title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-error" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
