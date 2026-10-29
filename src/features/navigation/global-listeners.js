/**
 * رتل - Ratil
 * مستمعات الأحداث العامة والتحكم بالمشغل (Global UI & Audio Player Listeners)
 * src/features/navigation/global-listeners.js
 */

import { state } from '../../core/state.js';
import {
  audio,
  togglePlayPause,
  seekRelative,
  openSleepTimerModal,
  closeSleepTimerModal,
  setSleepTimer
} from '../../core/audio-player.js';
import { changeFontSize, toggleReadingMode } from '../../ui/renderer.js';
import { toggleTheme } from '../../ui/theme.js';
import { handleSearch } from '../search/index.js';
import { openSurahView, closeSurahView } from './surah-viewer.js';
import { openReciterSheet, closeReciterSheet } from './reciter-picker.js';
import { setupSurahDownloadButton } from '../audio-download/index.js';

/**
 * ربط مستمعات عناصر التحكم بالواجهة، البحث، وأزرار المشغل
 */
export function setupEventListeners() {
  // تبديل المظهر
  document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);

  // شريط البحث المباشر
  const searchInput = document.getElementById('search-input');
  searchInput?.addEventListener('input', (e) => {
    handleSearch(e.target.value, (s, a) => openSurahView(s, a, 0, true));
  });
  document.getElementById('search-clear-btn')?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    handleSearch('', (s, a) => openSurahView(s, a, 0, true));
  });

  // إغلاق القوائم المنسدلة عند النقر في الخارج
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-section')) {
      document.getElementById('search-dropdown')?.classList.remove('active');
    }
    if (!e.target.closest('.verse-popup') && !e.target.closest('.aya-badge')) {
      document.getElementById('verse-popup')?.classList.remove('active');
    }
  });

  // بطاقات الاختصار السريع (الكهف، يس، الملك...)
  document.querySelectorAll('.shortcut-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const surahId = parseInt(chip.dataset.surahId, 10);
      const surah = state.surahs.find(s => s.id === surahId);
      if (surah) openReciterSheet(surah);
    });
  });

  // أزرار لوحة اختيار القارئ
  document.getElementById('sheet-close-btn')?.addEventListener('click', closeReciterSheet);
  document.getElementById('sheet-backdrop')?.addEventListener('click', closeReciterSheet);
  document.getElementById('sheet-start-btn')?.addEventListener('click', () => {
    if (state.currentSurah) openSurahView(state.currentSurah, 1, 0, true);
  });

  // أزرار شاشة القراءة
  document.getElementById('btn-back-home')?.addEventListener('click', closeSurahView);
  document.getElementById('btn-font-plus')?.addEventListener('click', () => changeFontSize(1));
  document.getElementById('btn-font-minus')?.addEventListener('click', () => changeFontSize(-1));
  document.getElementById('btn-reading-mode')?.addEventListener('click', toggleReadingMode);

  // زر تنزيل التلاوة دون اتصال
  const downloadBtn = document.getElementById('btn-download-surah');
  if (downloadBtn) {
    setupSurahDownloadButton(downloadBtn, () => ({
      surah: state.currentSurah,
      reciter: state.currentReciter
    }));
  }

  // أزرار المشغل الصوتي
  document.getElementById('main-play-btn')?.addEventListener('click', togglePlayPause);
  document.getElementById('collapsed-play-btn')?.addEventListener('click', togglePlayPause);
  document.getElementById('btn-seek-back')?.addEventListener('click', () => seekRelative(-10));
  document.getElementById('btn-seek-forward')?.addEventListener('click', () => seekRelative(10));
  document.getElementById('btn-open-reciters')?.addEventListener('click', () => {
    if (state.currentSurah) openReciterSheet(state.currentSurah);
  });

  // شريط التمرير الزمني (Scrubber Track)
  const track = document.getElementById('scrubber-track');
  track?.addEventListener('click', (e) => {
    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const fraction = 1 - (clickX / width);
    if (audio.duration) {
      audio.currentTime = fraction * audio.duration;
    }
  });

  // نافذة مؤقت النوم
  document.getElementById('btn-sleep-timer')?.addEventListener('click', openSleepTimerModal);
  document.getElementById('sleep-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'sleep-modal-backdrop') closeSleepTimerModal();
  });

  document.querySelectorAll('.sleep-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.sleepVal;
      if (val === 'end_of_surah') setSleepTimer('end_of_surah');
      else if (val === 'off') setSleepTimer(null);
      else setSleepTimer(parseInt(val, 10));
    });
  });
}
