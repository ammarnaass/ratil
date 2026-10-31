'use client';

/**
 * رتل - Ratil
 * زر كتم وإلغاء كتم الصوت
 * features/player/components/VolumeControl.tsx
 */

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export interface VolumeControlProps {
  isMuted: boolean;
  onToggleMute: () => void;
}

export function VolumeControl({ isMuted, onToggleMute }: VolumeControlProps) {
  return (
    <button
      onClick={onToggleMute}
      className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface transition-colors"
      title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
      aria-label={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
    >
      {isMuted ? (
        <VolumeX className="w-4 h-4 text-error" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </button>
  );
}

export default VolumeControl;
