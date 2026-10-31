'use client';

/**
 * رتل - Ratil
 * أزرار التحكم بالتشغيل والسرعة والتقديم والتأخير
 * features/player/components/PlayerControls.tsx
 */

import React from 'react';
import { Play, Pause, RotateCcw, RotateCw } from 'lucide-react';
import { formatTime } from '../utils/player.utils';

export interface PlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  onTogglePlay: () => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
  onCycleSpeed: () => void;
}

export function PlayerControls({
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  onTogglePlay,
  onSkipBackward,
  onSkipForward,
  onCycleSpeed,
}: PlayerControlsProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-full md:w-auto">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onSkipBackward}
          className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          title="تأخير 10 ثوانٍ"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={onTogglePlay}
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
          onClick={onSkipForward}
          className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          title="تقديم 10 ثوانٍ"
        >
          <RotateCw className="w-5 h-5" />
        </button>

        <button
          onClick={onCycleSpeed}
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
  );
}

export default PlayerControls;
