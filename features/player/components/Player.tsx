'use client';

/**
 * رتل - Ratil
 * مشغّل التلاوات الصوتي المتقن (Bottom Floating Player Container)
 * features/player/components/Player.tsx
 */

import React from 'react';
import type { PlayerProps } from '../types/player.types';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import PlayerProgressBar from './PlayerProgressBar';
import PlayerSurahInfo from './PlayerSurahInfo';
import PlayerControls from './PlayerControls';
import ReciterSelectMenu from './ReciterSelectMenu';
import OfflineButton from './OfflineButton';
import VolumeControl from './VolumeControl';

export function Player({
  surahId,
  surahName,
  reciters,
  initialAyah = 1,
}: PlayerProps) {
  const player = useAudioPlayer({
    surahId,
    surahName,
    reciters,
    initialAyah,
  });

  return (
    <>
      <audio
        ref={player.audioRef}
        src={player.audioUrl}
        preload="metadata"
        onTimeUpdate={player.handleTimeUpdate}
        onLoadedMetadata={player.handleLoadedMetadata}
        onEnded={() => player.setIsPlaying(false)}
        onPlay={() => player.setIsPlaying(true)}
        onPause={() => player.setIsPlaying(false)}
      />

      {/* شريط المشغل الثابت بالأسفل (Persistent Bottom Player) */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-surface-container-high shadow-2xl transition-all">
        {/* شريط التقدم الدقيق */}
        <PlayerProgressBar
          currentTime={player.currentTime}
          duration={player.duration}
          onSeek={player.handleSeek}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* معلومات السورة والقارئ والرواية */}
          <PlayerSurahInfo
            surahName={surahName}
            currentReciter={player.currentReciter}
            onToggleReciterMenu={() => player.setShowReciterMenu(!player.showReciterMenu)}
          />

          {/* أزرار التحكم بالصوت والتقديم والتأخير */}
          <PlayerControls
            isPlaying={player.isPlaying}
            currentTime={player.currentTime}
            duration={player.duration}
            playbackRate={player.playbackRate}
            onTogglePlay={player.togglePlay}
            onSkipBackward={() => player.skipSeconds(-10)}
            onSkipForward={() => player.skipSeconds(10)}
            onCycleSpeed={player.cycleSpeed}
          />

          {/* قائمة اختيار القارئ وزر الكاش دون إنترنت والتحكم بالصوت */}
          <div className="hidden md:flex items-center gap-3 relative">
            <OfflineButton
              audioUrl={player.audioUrl}
              surahId={surahId}
              surahName={surahName}
            />

            <ReciterSelectMenu
              reciters={reciters}
              currentReciter={player.currentReciter}
              isOpen={player.showReciterMenu}
              onToggle={() => player.setShowReciterMenu(!player.showReciterMenu)}
              onSelectReciter={(id) => {
                player.setCurrentReciterId(id);
                player.setShowReciterMenu(false);
              }}
            />

            <VolumeControl
              isMuted={player.isMuted}
              onToggleMute={player.toggleMute}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Player;
