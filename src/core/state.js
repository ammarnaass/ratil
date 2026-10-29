/**
 * رتل - Ratil
 * كائن الحالة العام للتطبيق
 * src/core/state.js
 */

export const state = {
  surahs: [],
  reciters: [],
  currentSurah: null,
  currentSurahData: null,
  currentReciter: null,
  currentNarration: 'hafs',
  currentView: 'home', // 'home' | 'browse' | 'reciters' | 'surah' | 'bookmarks'
  isPlaying: false,
  activeAyah: 1,
  fontSizeLevel: 2, // 1: صغير، 2: متوسط، 3: كبير
  isReadingMode: false,
  sleepTimer: 'end_of_surah',
  sleepTimerTimeout: null,
  loopAyah: null,
  lastSession: null,
  verseTimings: [],
  syncEngine: null
};
