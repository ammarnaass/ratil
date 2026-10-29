/**
 * رتل - Ratil
 * تكامل Media Session للتحكم في الصوت من شاشة القفل والأجهزة الذكية
 * lib/media-session.ts
 */

export interface MediaSessionOptions {
  surahName: string;
  reciterName: string;
  riwaya?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSeek?: (details: MediaSessionActionDetails) => void;
}

export function updateMediaSession(options: MediaSessionOptions): void {
  if (typeof window === 'undefined' || !('mediaSession' in navigator)) {
    return;
  }

  const { surahName, reciterName, riwaya, onPlay, onPause, onNext, onPrevious, onSeek } = options;

  navigator.mediaSession.metadata = new MediaMetadata({
    title: `سورة ${surahName}`,
    artist: reciterName,
    album: `رتل — القرآن الكريم ${riwaya ? `(${riwaya})` : ''}`,
    artwork: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  });

  const setAction = (action: MediaSessionAction, handler?: (details: MediaSessionActionDetails) => void) => {
    try {
      if (handler) {
        navigator.mediaSession.setActionHandler(action, handler);
      } else {
        navigator.mediaSession.setActionHandler(action, null);
      }
    } catch {
      // Ignored for unsupported action types
    }
  };

  if (onPlay) setAction('play', onPlay);
  if (onPause) setAction('pause', onPause);
  if (onNext) setAction('nexttrack', onNext);
  if (onPrevious) setAction('previoustrack', onPrevious);
  if (onSeek) setAction('seekto', onSeek);
}

export function updateMediaPositionState(duration: number, playbackRate = 1.0, position = 0): void {
  if (
    typeof window !== 'undefined' &&
    'mediaSession' in navigator &&
    'setPositionState' in navigator.mediaSession
  ) {
    try {
      if (duration > 0 && position <= duration) {
        navigator.mediaSession.setPositionState({
          duration,
          playbackRate,
          position: Math.max(0, position),
        });
      }
    } catch (e) {
      // Browser might restrict or throw on invalid bounds
    }
  }
}
