/**
 * رتل - Ratil
 * نقطة الدخول العامة لميزة التنقل والواجهات (Navigation Feature Public API)
 * src/features/navigation/index.js
 */

export { switchView, shareVerseLink, checkDeepLink } from './router.js';
export { openSurahView, closeSurahView, resumeSession } from './surah-viewer.js';
export { openReciterSheet, closeReciterSheet } from './reciter-picker.js';
export { setupScrollBehavior } from './scroll-behavior.js';
export { setupDesktopNavAndModals } from './desktop-nav.js';
export { setupEventListeners } from './global-listeners.js';
