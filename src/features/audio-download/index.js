/**
 * رتل - Ratil
 * نقطة الدخول العامة لميزة إدارة وتنزيل الصوتيات (Audio Download Feature Public API)
 * src/features/audio-download/index.js
 */

export {
  AUDIO_CACHE_NAME,
  downloadSurahAudio,
  deleteDownloadedSurahAudio,
  isSurahAudioCached,
  getAllDownloadedSurahs
} from './download-manager.js';

export {
  requestPersistentStorage,
  isStoragePersisted,
  getStorageQuotaEstimate,
  formatBytes
} from './storage-quota.js';

export {
  updateDownloadButtonVisuals,
  setupSurahDownloadButton
} from './offline-audio-ui.js';
