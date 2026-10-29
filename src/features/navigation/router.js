/**
 * رتل - Ratil
 * مدير التوجيه والروابط العميقة (Router & Deep Linking)
 * src/features/navigation/router.js
 */

import { state } from '../../core/state.js';
import { showToast } from '../../ui/toasts.js';
import { toIndicDigits } from '../../lib/normalize.js';
import { renderBrowseSurahGrid, renderRecitersFullGrid } from '../../ui/renderer.js';
import { renderBookmarksView } from '../bookmarks/index.js';
import { openReciterSheet } from './reciter-picker.js';

/**
 * التبديل بين شاشات التطبيق الرئيسية
 * @param {string} viewName - ('home' | 'browse' | 'reciters' | 'bookmarks' | 'surah')
 */
export function switchView(viewName) {
  state.currentView = viewName;

  document.querySelectorAll('.view-page').forEach(page => page.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));

  if (viewName === 'home') {
    document.getElementById('home-view-page')?.classList.add('active');
    document.getElementById('nav-home-btn')?.classList.add('active');
  } else if (viewName === 'browse') {
    document.getElementById('browse-view-page')?.classList.add('active');
    document.getElementById('nav-browse-btn')?.classList.add('active');
    renderBrowseSurahGrid('all', openReciterSheet);
  } else if (viewName === 'reciters') {
    document.getElementById('reciters-view-page')?.classList.add('active');
    document.getElementById('nav-reciters-btn')?.classList.add('active');
    renderRecitersFullGrid('all');
  } else if (viewName === 'bookmarks') {
    document.getElementById('bookmarks-view-page')?.classList.add('active');
    document.getElementById('nav-bookmarks-btn')?.classList.add('active');
    renderBookmarksView('all', '', (s, a) => {
      // استيراد ديناميكي أو تفويض لفتح السورة لتجنب الدائرية
      import('./surah-viewer.js').then(m => m.openSurahView(s, a, 0, true));
    });
  } else if (viewName === 'surah') {
    document.getElementById('surah-view-page')?.classList.add('active');
  }
}

/**
 * نسخ ومشاركة رابط مباشر لآية محددة
 * @param {number} ayaNum
 */
export function shareVerseLink(ayaNum) {
  const url = `${window.location.origin}${window.location.pathname}#surah=${state.currentSurah.id}&aya=${ayaNum}&reciter=${state.currentReciter.id}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      showToast(`تم نسخ رابط الآية ${toIndicDigits(ayaNum)} بنجاح`);
    });
  } else {
    showToast(url);
  }
}

/**
 * فحص الروابط العميقة في عنوان الصفحة (#surah=18&aya=45)
 */
export function checkDeepLink() {
  const hash = window.location.hash;
  if (!hash.includes('surah=')) return;

  const params = new URLSearchParams(hash.replace('#', ''));
  const surahId = parseInt(params.get('surah'), 10);
  const ayaNum = parseInt(params.get('aya'), 10) || 1;
  const reciterId = params.get('reciter');

  const surah = state.surahs.find(s => s.id === surahId);
  if (surah) {
    if (reciterId) {
      const r = state.reciters.find(item => item.id === reciterId);
      if (r) {
        state.currentReciter = r;
        state.currentNarration = r.narration;
      }
    }

    import('./surah-viewer.js').then(m => {
      m.openSurahView(surah, ayaNum, 0, true);
      setTimeout(() => {
        const el = document.getElementById(`verse-${ayaNum}`);
        if (el) el.classList.add('shared-flash');
      }, 400);
    });
  }
}
