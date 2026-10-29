/**
 * رتل - Ratil
 * موديول بناء وعرض عناصر الواجهة (UI Renderer)
 * src/ui/renderer.js
 */

import { state } from '../core/state.js';
import { formatTime, seekToAyah } from '../core/audio-player.js';
import { toIndicDigits } from '../lib/normalize.js';
import { showToast } from './toasts.js';

export function renderResumeCard(onResume) {
  const container = document.getElementById('resume-card-container');
  if (!container) return;

  const s = state.lastSession || {
    surahId: 18,
    surahNameAr: 'الكهف',
    reciterId: state.currentReciter?.id || 'minshawi-murattal-warsh',
    reciterNameAr: state.currentReciter?.name_ar || 'محمد صديق المنشاوي',
    narrationAr: state.currentReciter?.narration_ar || 'رواية ورش عن نافع',
    ayah: 45,
    currentTime: 1104, // 18:24
    duration: 2676,
    timestamp: Date.now() - 35 * 60 * 1000
  };

  const surah = state.surahs.find(item => item.id === s.surahId) || { total_ayahs: 110, name_ar: s.surahNameAr };
  const totalAyahs = surah.ayahs_hafs || surah.total_ayahs || 110;
  const progressPct = s.duration ? Math.min(100, Math.round((s.currentTime / s.duration) * 100)) : 41;
  const elapsedFormatted = formatTime(s.currentTime || 0);
  const remainingFormatted = formatTime(Math.max(0, (s.duration || 2676) - (s.currentTime || 0)));

  container.innerHTML = `
    <section class="spotlight-hero" id="spotlight-hero-card">
      <div class="spotlight-hero-glow"></div>
      <div class="spotlight-hero-inner">
        <div class="spotlight-info-col">
          <div class="spotlight-badge-row">
            <span class="spotlight-live-pill">
              <span class="pulse-dot"></span>
              استئناف الاستماع
            </span>
            <span class="spotlight-time-ago">${state.lastSession ? 'آخر جلسة محفوظة' : 'تلاوة مقترحة اليوم'}</span>
          </div>
          
          <h2 class="spotlight-surah-title">سورة ${s.surahNameAr}</h2>
          
          <p class="spotlight-reciter-line">
            <span>الشيخ ${s.reciterNameAr}</span>
            <span class="dot-separator"></span>
            <span>${s.narrationAr}</span>
          </p>

          <div class="spotlight-checkpoint-row">
            <span class="checkpoint-text">توقفت عند:</span>
            <span class="checkpoint-aya-badge">الآية ${toIndicDigits(s.ayah)}</span>
            <span class="checkpoint-total">/ ${toIndicDigits(totalAyahs)} آية</span>
            <span class="checkpoint-juz-tag">الجزء الخامس عشر</span>
          </div>

          <div class="spotlight-progress-box">
            <div class="spotlight-progress-track">
              <div class="spotlight-progress-fill" style="width: ${progressPct}%;"></div>
            </div>
            <div class="spotlight-progress-labels">
              <span>${elapsedFormatted} (المنقضي)</span>
              <span style="color: var(--color-primary); font-weight: 600;">${progressPct}٪ مكتمل</span>
              <span>${remainingFormatted} (المتبقي)</span>
            </div>
          </div>
        </div>

        <div class="spotlight-actions-col">
          <button class="spotlight-play-ring" id="btn-spotlight-play" aria-label="تشغيل فوري">
            <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
          <button class="spotlight-open-mushaf-btn" id="btn-spotlight-open-mushaf">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <span>فتح المصحف عند الآية</span>
          </button>
        </div>
      </div>
    </section>
  `;

  document.getElementById('btn-spotlight-play')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (onResume) onResume(true);
  });

  document.getElementById('btn-spotlight-open-mushaf')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (onResume) onResume(false);
  });

  document.getElementById('spotlight-hero-card')?.addEventListener('click', () => {
    if (onResume) onResume(true);
  });
}

export function renderRecentHistory(onSelectSurah) {
  const container = document.getElementById('recent-cards-container');
  if (!container) return;

  const recents = [
    { surahId: 19, name: 'سورة مريم', reciter: 'الشيخ محمود خليل الحصري' },
    { surahId: 12, name: 'سورة يوسف', reciter: 'الشيخ مشاري راشد العفاسي' },
    { surahId: 24, name: 'سورة النور', reciter: 'الشيخ ياسين الجزائري' }
  ];

  container.innerHTML = recents.map(r => `
    <div class="recent-card" data-surah-id="${r.surahId}">
      <div class="recent-card-info">
        <div class="recent-play-icon-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
        <div class="recent-names">
          <span class="recent-surah-name">${r.name}</span>
          <span class="recent-reciter-name">${r.reciter}</span>
        </div>
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="2">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </div>
  `).join('');

  container.querySelectorAll('.recent-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.surahId, 10);
      const surah = state.surahs.find(s => s.id === id);
      if (surah && onSelectSurah) onSelectSurah(surah);
    });
  });
}

export function renderSurahList(surahsToRender, onSelectSurah) {
  const grid = document.getElementById('surah-grid');
  if (!grid) return;

  grid.innerHTML = surahsToRender.map(s => `
    <div class="surah-card" data-surah-id="${s.id}">
      <div class="surah-card-left">
        <span class="surah-index">${s.id}</span>
        <div class="surah-names-box">
          <span class="surah-ar-name">${s.name_ar}</span>
          <span class="surah-en-name">${s.name_en}</span>
        </div>
      </div>
      <div class="surah-card-right">
        <span class="surah-meta-badge">${s.type}</span>
        <span class="surah-ayah-count">${s.ayahs_hafs} آية</span>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.surah-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.surahId, 10);
      const surah = state.surahs.find(s => s.id === id);
      if (surah && onSelectSurah) onSelectSurah(surah);
    });
  });
}

export function renderBrowseSurahGrid(filter = 'all', onSelectSurah) {
  const grid = document.getElementById('browse-surah-grid');
  if (!grid) return;

  let list = state.surahs;
  if (filter === 'makki') {
    list = state.surahs.filter(s => s.type === 'مكية');
  } else if (filter === 'madani') {
    list = state.surahs.filter(s => s.type === 'مدنية');
  }

  grid.innerHTML = list.map(s => `
    <div class="surah-card" data-surah-id="${s.id}">
      <div class="surah-card-left">
        <span class="surah-index">${s.id}</span>
        <div class="surah-names-box">
          <span class="surah-ar-name">${s.name_ar}</span>
          <span class="surah-en-name">صفحة ${s.page}</span>
        </div>
      </div>
      <div class="surah-card-right">
        <span class="surah-meta-badge">${s.type}</span>
        <span class="surah-ayah-count">${s.ayahs_hafs} آية</span>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.surah-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.surahId, 10);
      const surah = state.surahs.find(s => s.id === id);
      if (surah && onSelectSurah) onSelectSurah(surah);
    });
  });
}

export function renderRecitersFullGrid(narrationFilter = 'all', onReciterChanged) {
  const grid = document.getElementById('reciters-full-grid');
  if (!grid) return;

  let list = state.reciters;
  if (narrationFilter === 'hafs') {
    list = state.reciters.filter(r => r.narration === 'hafs');
  } else if (narrationFilter === 'warsh') {
    list = state.reciters.filter(r => r.narration === 'warsh');
  }

  grid.innerHTML = list.map(r => `
    <div class="reciter-card-full" data-reciter-id="${r.id}">
      <div class="reciter-card-top">
        <div class="reciter-avatar-circle">
          ${r.name_ar.charAt(0)}
        </div>
        <div>
          <h4 class="reciter-title-text">${r.name_ar}</h4>
          <span class="reciter-sub-text">${r.narration_ar}</span>
        </div>
      </div>
      <div class="reciter-card-bottom">
        <span class="tag-pill">${r.bitrate} · موثق</span>
        <button class="reciter-btn-select" data-reciter-id="${r.id}">
          ${state.currentReciter?.id === r.id ? '✓ القارئ الحالي' : 'اختيار القارئ'}
        </button>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.reciter-card-full').forEach(card => {
    card.addEventListener('click', () => {
      const rId = card.dataset.reciterId;
      const reciter = state.reciters.find(r => r.id === rId);
      if (reciter) {
        state.currentReciter = reciter;
        state.currentNarration = reciter.narration;
        localStorage.setItem('ratil_last_reciter', reciter.id);
        renderRecitersFullGrid(narrationFilter, onReciterChanged);
        showToast(`تم اختيار القارئ: ${reciter.name_ar}`);
        if (onReciterChanged) onReciterChanged(reciter);
      }
    });
  });
}

export function renderQuranText(data, onBadgeClick) {
  const container = document.getElementById('quran-text-container');
  if (!container) return;

  const showBasmalah = data.id !== 9 && data.id !== 1;
  let html = '';

  if (showBasmalah) {
    html += `<div class="basmalah-box">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>`;
  }

  html += data.ayahs.map(a => `
    <span class="quran-verse ${a.aya === state.activeAyah ? 'active-verse' : ''}" 
          id="verse-${a.aya}" 
          data-aya="${a.aya}">
      ${a.text_uthmani}
      <span class="aya-badge" data-aya="${a.aya}">${a.aya_indic}</span>
    </span>
  `).join(' ');

  container.innerHTML = html;

  container.querySelectorAll('.quran-verse').forEach(el => {
    el.addEventListener('click', (e) => {
      const ayaNum = parseInt(el.dataset.aya, 10);
      if (e.target.classList.contains('aya-badge')) {
        if (onBadgeClick) onBadgeClick(ayaNum, e.target);
      } else {
        seekToAyah(ayaNum);
      }
    });
  });
}

export function changeFontSize(delta) {
  state.fontSizeLevel = Math.max(1, Math.min(3, state.fontSizeLevel + delta));
  const sizes = {
    1: { mobile: '20px', desktop: '22px' },
    2: { mobile: '22px', desktop: '26px' },
    3: { mobile: '26px', desktop: '32px' }
  };
  const isDesktop = window.innerWidth >= 768;
  const chosenSize = isDesktop ? sizes[state.fontSizeLevel].desktop : sizes[state.fontSizeLevel].mobile;

  document.documentElement.style.setProperty('--font-size-quran', chosenSize);
  showToast(`حجم الخط: ${state.fontSizeLevel === 1 ? 'صغير' : state.fontSizeLevel === 2 ? 'متوسط' : 'كبير'}`);
}

export function toggleReadingMode() {
  state.isReadingMode = !state.isReadingMode;
  const header = document.getElementById('site-header');
  const surahHeader = document.getElementById('surah-view-header');
  const player = document.getElementById('audio-player-bar');

  if (state.isReadingMode) {
    if (header) header.style.display = 'none';
    if (surahHeader) surahHeader.style.display = 'none';
    if (player) player.style.display = 'none';
    showToast('وضع القراءة المجردة: اضغط في أي مكان للخروج');

    const exitHandler = () => {
      toggleReadingMode();
      document.removeEventListener('click', exitHandler);
    };
    setTimeout(() => {
      document.addEventListener('click', exitHandler);
    }, 200);
  } else {
    if (header) header.style.display = '';
    if (surahHeader) surahHeader.style.display = '';
    if (player) player.style.display = '';
  }
}

export function showVersePopup(ayaNum, anchorElement, onShare, onLoop) {
  const popup = document.getElementById('verse-popup');
  if (!popup) return;

  const rect = anchorElement.getBoundingClientRect();
  popup.style.top = `${rect.bottom + window.scrollY + 6}px`;
  popup.style.left = `${rect.left + (rect.width / 2) - 60}px`;
  popup.classList.add('active');

  const shareBtn = document.getElementById('popup-share-btn');
  const loopBtn = document.getElementById('popup-loop-btn');

  if (shareBtn) {
    shareBtn.onclick = () => {
      if (onShare) onShare(ayaNum);
      popup.classList.remove('active');
    };
  }

  if (loopBtn) {
    loopBtn.onclick = () => {
      if (onLoop) onLoop(ayaNum);
      popup.classList.remove('active');
    };
  }
}
