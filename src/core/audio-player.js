/**
 * رتل - Ratil
 * محرك الصوت ومشغل التلاوات
 * src/core/audio-player.js
 */

import { state } from './state.js';
import { saveSession } from './storage.js';
import { showToast } from '../ui/toasts.js';
import { toIndicDigits } from '../lib/normalize.js';

export const audio = new Audio();
export const previewAudio = new Audio();

export function getSurahAudioUrl(reciter, surahId) {
  const pad3 = String(surahId).padStart(3, '0');
  if (reciter.id === 'yassin_al_jazaery') {
    return `${reciter.audio_base_url}/${pad3}001.mp3`;
  }
  return `${reciter.audio_base_url}/${pad3}.mp3`;
}

export function formatTime(sec) {
  const s = Math.floor(sec || 0);
  const m = Math.floor(s / 60);
  const remainingS = s % 60;
  return `${m}:${remainingS < 10 ? '0' : ''}${remainingS}`;
}

export function updatePlayBtnVisuals() {
  const icon = state.isPlaying
    ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
    : `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;

  const collapsedIcon = state.isPlaying
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;

  const mainBtn = document.getElementById('main-play-btn');
  const collapsedBtn = document.getElementById('collapsed-play-btn');

  if (mainBtn) mainBtn.innerHTML = icon;
  if (collapsedBtn) collapsedBtn.innerHTML = collapsedIcon;
}

export function updatePlayerTrackInfo() {
  const surahTitle = state.currentSurah ? `سورة ${state.currentSurah.name_ar}` : 'رتل';
  const reciterTitle = state.currentReciter ? `${state.currentReciter.name_ar} (${state.currentReciter.narration_ar})` : 'اختر سورة';

  const sTitleEl = document.getElementById('player-surah-title');
  const rNameEl = document.getElementById('player-reciter-name');
  const cTitleEl = document.getElementById('collapsed-surah-title');

  if (sTitleEl) sTitleEl.textContent = surahTitle;
  if (rNameEl) rNameEl.textContent = reciterTitle;
  if (cTitleEl) cTitleEl.textContent = `${surahTitle} — ${state.currentReciter?.name_ar || ''}`;
}

export function updateScrubber() {
  const fill = document.getElementById('scrubber-fill');
  const thumb = document.getElementById('scrubber-thumb');
  const currentLabel = document.getElementById('time-current');
  const durationLabel = document.getElementById('time-duration');

  const curr = audio.currentTime || 0;
  const dur = audio.duration || 1;
  const pct = Math.min(100, (curr / dur) * 100);

  if (fill) fill.style.width = `${pct}%`;
  if (thumb) thumb.style.right = `${pct}%`;
  if (currentLabel) currentLabel.textContent = formatTime(curr);
  if (durationLabel) durationLabel.textContent = formatTime(dur);
}

export function highlightAyah(ayaNum) {
  state.activeAyah = ayaNum;
  document.querySelectorAll('.quran-verse').forEach(el => {
    el.classList.remove('active-verse');
  });
  const activeEl = document.getElementById(`verse-${ayaNum}`);
  if (activeEl) {
    activeEl.classList.add('active-verse');
  }
}

export function scrollToAyah(ayaNum) {
  const el = document.getElementById(`verse-${ayaNum}`);
  if (el) {
    const yOffset = -140; // مساحة أعلى الآية تحت الترويسة
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

export function seekToAyah(ayaNum) {
  if (!state.currentSurahData) return;
  const total = state.currentSurahData.ayahs.length;
  if (total === 0) return;

  // إذا كانت مصفوفة التوقيت متوفرة
  if (state.syncEngine && state.syncEngine.hasTimings()) {
    const seg = state.syncEngine.timings.find(t => (t.aya || t.ayah) === ayaNum);
    if (seg) {
      const startMs = seg.start_ms !== undefined ? seg.start_ms : seg.start_time;
      audio.currentTime = startMs / 1000;
      highlightAyah(ayaNum);
      scrollToAyah(ayaNum);
      return;
    }
  }

  // Fallback نسبي
  const fraction = (ayaNum - 1) / total;
  if (audio.duration) {
    audio.currentTime = fraction * audio.duration;
  }

  highlightAyah(ayaNum);
  scrollToAyah(ayaNum);
}

export function syncActiveAyahWithTime() {
  if (!state.currentSurahData || !state.currentSurahData.ayahs.length) return;
  const totalAyahs = state.currentSurahData.ayahs.length;
  const dur = audio.duration;
  if (!dur || dur <= 0) return;

  let currentAyah = 1;
  if (state.syncEngine) {
    currentAyah = state.syncEngine.getActiveAyah(audio.currentTime, dur, totalAyahs);
  } else {
    const fraction = audio.currentTime / dur;
    currentAyah = Math.min(totalAyahs, Math.max(1, Math.floor(fraction * totalAyahs) + 1));
  }

  if (state.loopAyah && currentAyah !== state.loopAyah) {
    seekToAyah(state.loopAyah);
    return;
  }

  if (currentAyah !== state.activeAyah) {
    highlightAyah(currentAyah);
    if (!state.isReadingMode) {
      scrollToAyah(currentAyah);
    }
  }
}

export function togglePlayPause() {
  if (audio.paused) {
    audio.play().then(() => {
      state.isPlaying = true;
      updatePlayBtnVisuals();
    }).catch(e => console.warn('تشغيل الصوت يتطلب تفاعل المستخدم:', e));
  } else {
    audio.pause();
    state.isPlaying = false;
    updatePlayBtnVisuals();
  }
}

export function seekRelative(seconds) {
  if (!audio.duration) return;
  audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
}

export function saveCurrentSessionState() {
  if (!state.currentSurah || !state.currentReciter) return;
  const session = {
    surahId: state.currentSurah.id,
    surahNameAr: state.currentSurah.name_ar,
    reciterId: state.currentReciter.id,
    reciterNameAr: state.currentReciter.name_ar,
    narration: state.currentNarration,
    narrationAr: state.currentReciter.narration_ar,
    ayah: state.activeAyah,
    currentTime: audio.currentTime || 0,
    duration: audio.duration || 0,
    timestamp: Date.now()
  };
  saveSession(session);
  localStorage.setItem('ratil_last_reciter', state.currentReciter.id);
  state.lastSession = session;
}

export function updateMediaSession(surah, reciter) {
  if (!('mediaSession' in navigator)) return;

  navigator.mediaSession.metadata = new MediaMetadata({
    title: `سورة ${surah.name_ar}`,
    artist: `${reciter.name_ar} (${reciter.narration_ar})`,
    album: 'رتل — مصحف مسموع'
  });

  navigator.mediaSession.setActionHandler('play', () => audio.play());
  navigator.mediaSession.setActionHandler('pause', () => audio.pause());
  navigator.mediaSession.setActionHandler('seekbackward', () => seekRelative(-10));
  navigator.mediaSession.setActionHandler('seekforward', () => seekRelative(10));
}

export function setupAudioListeners() {
  audio.addEventListener('timeupdate', () => {
    updateScrubber();
    syncActiveAyahWithTime();
    saveCurrentSessionState();
  });

  audio.addEventListener('play', () => {
    state.isPlaying = true;
    updatePlayBtnVisuals();
  });

  audio.addEventListener('pause', () => {
    state.isPlaying = false;
    updatePlayBtnVisuals();
    saveCurrentSessionState();
  });

  audio.addEventListener('ended', () => {
    state.isPlaying = false;
    updatePlayBtnVisuals();
    if (state.sleepTimer === 'end_of_surah') {
      showToast('اكتملت السورة وتوقف المشغل (مؤقت النوم).');
    }
  });
}

export function loadSurahAudio(surahId, startTime = 0, autoPlay = true) {
  const audioUrl = getSurahAudioUrl(state.currentReciter, surahId);
  audio.src = audioUrl;
  audio.currentTime = startTime;

  updatePlayerTrackInfo();

  if (autoPlay) {
    audio.play().then(() => {
      state.isPlaying = true;
      updatePlayBtnVisuals();
    }).catch(err => {
      console.warn('يتطلب التشغيل تفاعل المستخدم أولاً:', err);
    });
  }
}

// مؤقت النوم
export function openSleepTimerModal() {
  document.getElementById('sleep-modal-backdrop')?.classList.add('active');
}

export function closeSleepTimerModal() {
  document.getElementById('sleep-modal-backdrop')?.classList.remove('active');
}

export function setSleepTimer(val) {
  state.sleepTimer = val;
  clearTimeout(state.sleepTimerTimeout);

  if (typeof val === 'number') {
    state.sleepTimerTimeout = setTimeout(() => {
      audio.pause();
      state.isPlaying = false;
      updatePlayBtnVisuals();
      showToast(`انتهى مؤقت النوم (${val} دقيقة) وتم إيقاف التلاوة.`);
    }, val * 60 * 1000);
    showToast(`تم ضبط مؤقت النوم: ${val} دقيقة`);
  } else if (val === 'end_of_surah') {
    showToast('سيتوقف المشغل تلقائياً عند نهاية السورة');
  } else {
    showToast('تم إلغاء مؤقت النوم');
  }

  document.querySelectorAll('.sleep-option-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.sleepVal === String(val));
  });

  closeSleepTimerModal();
}

// تكرار الآية للحفظ
export function toggleLoopVerse(ayaNum) {
  if (state.loopAyah === ayaNum) {
    state.loopAyah = null;
    showToast('تم إلغاء تكرار الآية');
  } else {
    state.loopAyah = ayaNum;
    seekToAyah(ayaNum);
    showToast(`تكرار الآية ${toIndicDigits(ayaNum)} للحفظ مُفعَّل`);
  }
}
