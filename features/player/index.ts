'use client';

/**
 * رتل - Ratil
 * نقطة التصدير العامة لميزة مشغّل التلاوات الصوتي (Public API)
 * features/player/index.ts
 */

// الأنواع (Types)
export * from './types/player.types';

// الثوابت (Constants)
export * from './constants/player.constants';

// الدوال المساعدة (Utils)
export * from './utils/player.utils';

// الخطافات المخصصة (Hooks)
export * from './hooks/useAudioPlayer';
export * from './hooks/useOfflineAudio';

// المكونات البصرية (Components)
export * from './components/PlayerProgressBar';
export * from './components/PlayerSurahInfo';
export * from './components/PlayerControls';
export * from './components/ReciterSelectMenu';
export * from './components/OfflineButton';
export * from './components/VolumeControl';
export * from './components/Player';

// التصدير الافتراضي
export { default } from './components/Player';
