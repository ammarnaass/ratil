'use client';

/**
 * رتل - Ratil
 * شريط تقدم التلاوة الدقيق والتمرير السريع
 * features/player/components/PlayerProgressBar.tsx
 */

import React from 'react';

export interface PlayerProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PlayerProgressBar({
  currentTime,
  duration,
  onSeek,
}: PlayerProgressBarProps) {
  const percentage = (currentTime / (duration || 1)) * 100;

  return (
    <div className="w-full h-1.5 bg-surface-container-high relative group cursor-pointer">
      <input
        type="range"
        min={0}
        max={duration || 100}
        value={currentTime}
        onChange={onSeek}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        aria-label="شريط تقدم التلاوة"
      />
      <div
        className="h-full bg-primary relative transition-all"
        style={{ width: `${percentage}%` }}
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-on-primary-container rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

export default PlayerProgressBar;
