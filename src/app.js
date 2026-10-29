/**
 * رتل - Ratil
 * نقطة الإقلاع والربط العامة للتطبيق (Bootstrapper)
 * مبني وفق معمارية الوحدات المعيارية (ES Modules) دون أي أُطر عمل
 * src/app.js
 */

import { state } from './core/state.js';
import { loadJson } from './lib/api.js';
import { initDB, loadSession } from './core/storage.js';
import { loadStoredTheme } from './ui/theme.js';
import { setupAudioListeners } from './core/audio-player.js';
import {
  renderResumeCard,
  renderRecentHistory,
  renderSurahList,
  renderBrowseSurahGrid,
  renderRecitersFullGrid
} from './ui/renderer.js';
import {
  setupEventListeners,
  setupScrollBehavior,
  setupDesktopNavAndModals,
  checkDeepLink,
  resumeSession,
  openReciterSheet
} from './features/navigation/index.js';

/**
 * تسجيل مشغل الخدمة للعمل دون اتصال (PWA Service Worker)
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/public/sw.js')
        .catch(() => navigator.serviceWorker.register('/sw.js'))
        .then((reg) => {
          if (reg) console.log('✓ تم تسجيل Service Worker بنجاح (تشغيل دون اتصال متاح)');
        })
        .catch((err) => {
          console.warn('تعذر تسجيل Service Worker:', err);
        });
    });
  }
}

/**
 * التهيئة الأولية للمشروع
 */
async function initApp() {
  // 1. إدارة المظهر وتخزين الجلسة وقاعدة البيانات
  loadStoredTheme();
  await initDB();
  state.lastSession = loadSession();

  try {
    // 2. تحميل فهرس السور والقرّاء المعتمدين
    const [surahsList, recitersManifest] = await Promise.all([
      loadJson('/data/surahs.json'),
      loadJson('/audio-manifest/reciters.json')
    ]);

    state.surahs = surahsList;
    state.reciters = recitersManifest.reciters;

    // ضبط القارئ والرواية الافتراضية
    const savedReciterId = localStorage.getItem('ratil_last_reciter');
    state.currentReciter = state.reciters.find(r => r.id === savedReciterId) || state.reciters[0];
    state.currentNarration = state.currentReciter.narration;

    // 3. بناء عناصر الواجهات الأولية
    renderResumeCard(resumeSession);
    renderRecentHistory(openReciterSheet);
    renderSurahList(state.surahs, openReciterSheet);
    renderBrowseSurahGrid('all', openReciterSheet);
    renderRecitersFullGrid('all');

    // 4. ربط مستمعات الأحداث والصوت والتمرير
    setupEventListeners();
    setupAudioListeners();
    setupScrollBehavior();
    setupDesktopNavAndModals();

    // 5. التحقق من الروابط العميقة المباشرة
    checkDeepLink();

    // 6. تسجيل Service Worker
    registerServiceWorker();

  } catch (err) {
    console.error('فشل إقلاع تطبيق رتل:', err);
  }
}

// بدء التشغيل فور اكتمال تحميل DOM
document.addEventListener('DOMContentLoaded', initApp);
