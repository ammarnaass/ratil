'use client';

/**
 * رتل - Ratil
 * خطاف إدارة تشغيل الصوت وعناصر التحكم وتكامل MediaSession والتخزين
 * features/player/hooks/useAudioPlayer.ts
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Reciter } from '@/lib/types';
import { saveLastPlayed, getLastPlayed } from '@/lib/storage';
import { updateMediaSession, updateMediaPositionState } from '@/lib/media-session';
import {
  PLAYBACK_SPEEDS,
  DEFAULT_RECITER_ID,
  DEFAULT_SKIP_SECONDS,
} from '../constants/player.constants';
import { getSurahAudioUrl } from '../utils/player.utils';

export interface UseAudioPlayerOptions {
  surahId: number;
  surahName: string;
  reciters: Reciter[];
  initialAyah?: number;
}

export function useAudioPlayer({
  surahId,
  surahName,
  reciters,
  initialAyah = 1,
}: UseAudioPlayerOptions) {
  const [currentReciterId, setCurrentReciterId] = useState<string>(
    reciters[0]?.id || DEFAULT_RECITER_ID
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showReciterMenu, setShowReciterMenu] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentReciter =
    reciters.find((r) => r.id === currentReciterId) ||
    reciters[0] || {
      id: DEFAULT_RECITER_ID,
      name: 'الشيخ محمد صديق المنشاوي',
      riwaya: 'hafs',
    };

  const audioUrl = getSurahAudioUrl(currentReciter, surahId);

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

  const handlePlay = useCallback(() => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
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
  }, [surahName, currentReciter, surahId, handlePlay, handlePause]);

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

  const skipSeconds = (sec: number = DEFAULT_SKIP_SECONDS) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(duration, audioRef.current.currentTime + sec)
      );
    }
  };

  const cycleSpeed = () => {
    const nextIdx = (PLAYBACK_SPEEDS.indexOf(playbackRate as any) + 1) % PLAYBACK_SPEEDS.length;
    const nextSpeed = PLAYBACK_SPEEDS[nextIdx];
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

  return {
    audioRef,
    audioUrl,
    currentReciter,
    currentReciterId,
    setCurrentReciterId,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    volume,
    setVolume,
    isMuted,
    showReciterMenu,
    setShowReciterMenu,
    togglePlay,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleSeek,
    skipSeconds,
    cycleSpeed,
    toggleMute,
    setIsPlaying,
  };
}
