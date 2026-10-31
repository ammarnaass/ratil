/**
 * رتل - Ratil
 * أنواع ومعرّفات مشغّل التلاوات الصوتي
 * features/player/types/player.types.ts
 */

import type { Reciter } from '@/lib/types';

export interface PlayerProps {
  surahId: number;
  surahName: string;
  reciters: Reciter[];
  initialAyah?: number;
}

export interface AudioPlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
}

export interface OfflineCacheState {
  isCached: boolean;
  isLoading: boolean;
  progress: number;
}
