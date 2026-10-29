/**
 * رتل - Ratil
 * نافذة اختيار القارئ والرواية (Reciter Selection Bottom Sheet)
 * src/features/navigation/reciter-picker.js
 */

import { state } from '../../core/state.js';

/**
 * فتح لوحة اختيار القارئ لسورة معينة
 * @param {object} surah
 */
export function openReciterSheet(surah) {
  state.currentSurah = surah;
  const titleEl = document.getElementById('sheet-surah-title');
  if (titleEl) titleEl.textContent = `سورة ${surah.name_ar}`;

  const container = document.getElementById('reciter-list-container');
  if (!container) return;

  container.innerHTML = state.reciters.map(r => `
    <div class="reciter-option-card ${r.id === state.currentReciter?.id ? 'selected' : ''}" data-reciter-id="${r.id}">
      <div class="reciter-option-left">
        <div class="reciter-name">${r.name_ar}</div>
        <span class="reciter-narration-badge">${r.narration_ar}</span>
      </div>
      <div class="reciter-select-indicator">${r.id === state.currentReciter?.id ? '✓' : ''}</div>
    </div>
  `).join('');

  container.querySelectorAll('.reciter-option-card').forEach(card => {
    card.addEventListener('click', () => {
      const reciterId = card.dataset.reciterId;
      state.currentReciter = state.reciters.find(r => r.id === reciterId);
      state.currentNarration = state.currentReciter.narration;
      localStorage.setItem('ratil_last_reciter', state.currentReciter.id);

      container.querySelectorAll('.reciter-option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });

  document.getElementById('sheet-backdrop')?.classList.add('active');
  document.getElementById('reciter-sheet')?.classList.add('active');
}

/**
 * إغلاق لوحة اختيار القارئ
 */
export function closeReciterSheet() {
  document.getElementById('sheet-backdrop')?.classList.remove('active');
  document.getElementById('reciter-sheet')?.classList.remove('active');
}
