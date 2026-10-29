/**
 * رتل - Ratil
 * مشغّل وعارض السور والنصوص القرآنية (Surah Viewer & Session Management)
 * src/features/navigation/surah-viewer.js
 */

import { state } from '../../core/state.js';
import { loadJson } from '../../lib/api.js';
import { showToast } from '../../ui/toasts.js';
import { VerseSyncEngine } from '../verse-sync/index.js';
import {
  loadSurahAudio,
  scrollToAyah,
  updateMediaSession,
  toggleLoopVerse
} from '../../core/audio-player.js';
import {
  renderResumeCard,
  renderQuranText,
  showVersePopup
} from '../../ui/renderer.js';
import { switchView, shareVerseLink } from './router.js';
import { closeReciterSheet } from './reciter-picker.js';
import { isSurahAudioCached, updateDownloadButtonVisuals } from '../audio-download/index.js';

/**
 * فتح شاشة عرض السورة وبدء التلاوة
 * @param {object} surah
 * @param {number} startAyah
 * @param {number} startTime
 * @param {boolean} autoPlay
 */
export async function openSurahView(surah, startAyah = 1, startTime = 0, autoPlay = true) {
  closeReciterSheet();

  state.currentSurah = surah;
  state.activeAyah = startAyah;

  switchView('surah');

  // تحديث الترويسة
  const titleEl = document.getElementById('view-surah-title');
  const subEl = document.getElementById('view-surah-sub');
  if (titleEl) titleEl.textContent = `سورة ${surah.name_ar}`;
  if (subEl) subEl.textContent = `${state.currentReciter?.name_ar || ''} · ${state.currentReciter?.narration_ar || ''}`;

  // ضبط خط القراءة المناسب للرواية (حفص أو ورش)
  const textContainer = document.getElementById('quran-text-container');
  if (textContainer) {
    textContainer.style.fontFamily = state.currentNarration === 'warsh'
      ? 'var(--font-quran-warsh)'
      : 'var(--font-quran-hafs)';
  }

  // تحميل ملف السورة المعتمد
  const surahFileUrl = `/data/${state.currentNarration}/${surah.id}.json`;
  try {
    state.currentSurahData = await loadJson(surahFileUrl);
  } catch (err) {
    console.error('فشل تحميل نص السورة:', err);
    showToast('تعذر تحميل نص السورة.');
    return;
  }

  // محاولة تحميل بيانات التوقيت الموثقة (Millisecond Timings) إن وجدت
  try {
    const timingUrl = `/data/timings/${state.currentReciter.id}/${surah.id}.json`;
    const timings = await loadJson(timingUrl);
    state.syncEngine = new VerseSyncEngine(timings, state.currentSurahData.ayahs.length);
  } catch (e) {
    // Fallback إلى التقدير النسبي إذا لم تتوفر مصفوفة توقيت مسبقة
    state.syncEngine = new VerseSyncEngine([], state.currentSurahData.ayahs.length);
  }

  // بناء النص القرآني
  renderQuranText(state.currentSurahData, (ayaNum, badgeEl) => {
    showVersePopup(ayaNum, badgeEl, shareVerseLink, toggleLoopVerse);
  });

  // إعداد وتشغيل الصوت
  loadSurahAudio(surah.id, startTime, autoPlay);

  // تمرير إلى الآية المحددة بعد اكتمال العرض
  setTimeout(() => {
    scrollToAyah(startAyah);
  }, 150);

  // تحديث Media Session
  updateMediaSession(surah, state.currentReciter);

  // تحديث حالة زر التحميل للأوفلاين للسورة والقارئ الحالي
  const downloadBtn = document.getElementById('btn-download-surah');
  if (downloadBtn && state.currentReciter) {
    isSurahAudioCached(state.currentReciter.id, surah.id).then(isCached => {
      updateDownloadButtonVisuals(downloadBtn, isCached ? 'downloaded' : 'idle');
    });
  }
}

/**
 * إغلاق شاشة السورة والعودة للرئيسية
 */
export function closeSurahView() {
  switchView('home');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderResumeCard(resumeSession);
}

/**
 * استئناف الجلسة الأخيرة
 * @param {boolean} autoPlay
 */
export async function resumeSession(autoPlay = true) {
  const s = state.lastSession || {
    surahId: 18,
    ayah: 45,
    currentTime: 1104,
    reciterId: state.currentReciter?.id
  };
  const surah = state.surahs.find(item => item.id === s.surahId) || state.surahs[17];
  const reciter = state.reciters.find(item => item.id === s.reciterId) || state.currentReciter;

  if (surah) {
    state.currentReciter = reciter;
    state.currentNarration = reciter.narration;
    await openSurahView(surah, s.ayah, s.currentTime, autoPlay);
  }
}
