/**
 * رتل - Ratil
 * واجهة وعرض بطاقات المحفوظات (Bookmarks View Component)
 * src/features/bookmarks/bookmarks.view.js
 */

import { getBookmarks, getDownloadedSurahs } from '../../core/storage.js';
import { formatBytes } from '../audio-download/index.js';
import { bindBookmarkEvents } from './bookmarks.controller.js';

/**
 * بناء وعرض شاشة المحفوظات مع الفلترة والبحث
 * @param {string} filterType - نوع التصفية ('all' | 'starred' | 'khatmah' | 'audio')
 * @param {string} query - نص البحث في المحفوظات
 * @param {Function} onPlayBookmark - عند النقر على استماع الآية
 */
export async function renderBookmarksView(filterType = 'all', query = '', onPlayBookmark) {
  const grid = document.getElementById('bookmarks-grid-items');
  const countBadge = document.getElementById('bm-count-display');
  if (!grid) return;

  // تحديث عداد التلاوات المحفوظة أوفلاين في شريط القياسات
  const offlineMetric = document.getElementById('metric-offline-audio-count');
  if (offlineMetric) {
    getDownloadedSurahs().then(downloads => {
      const totalBytes = downloads.reduce((acc, cur) => acc + (cur.sizeBytes || 0), 0);
      const formatted = formatBytes(totalBytes);
      offlineMetric.textContent = `${downloads.length} سور (${formatted})`;
    });
  }

  let items = await getBookmarks();

  if (filterType && filterType !== 'all') {
    items = items.filter(item => item.type === filterType);
  }

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    items = items.filter(item => 
      (item.surahName && item.surahName.toLowerCase().includes(q)) || 
      (item.text && item.text.toLowerCase().includes(q)) || 
      (item.reciter && item.reciter.toLowerCase().includes(q))
    );
  }

  if (countBadge) {
    countBadge.textContent = `عرض ${items.length} عنصر`;
  }

  if (items.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 48px 20px; text-align: center; color: var(--color-text-secondary);">
        <p style="font-size: 16px; margin-bottom: 8px;">لا توجد عناصر محفوظة تطابق معايير التصفية.</p>
        <button class="btn-secondary-action" id="btn-show-all-bm">عرض كافة المحفوظات</button>
      </div>
    `;
    document.getElementById('btn-show-all-bm')?.addEventListener('click', () => {
      document.querySelector('.bm-tab-btn[data-bm-type="all"]')?.click();
    });
    return;
  }

  grid.innerHTML = items.map(bm => `
    <article class="bm-card" data-bm-id="${bm.id}">
      <div class="bm-card-head">
        <div>
          <h4 class="bm-card-title">${bm.surahName} • الآية ${bm.ayah}</h4>
          <div class="bm-card-meta">
            <span>${bm.reciter}</span>
            <span>•</span>
            <span>${bm.meta}</span>
          </div>
        </div>
        <button class="bm-card-star" title="تبديل التفضيل" data-id="${bm.id}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="${bm.type === 'starred' ? '#85f6db' : 'none'}" stroke="#85f6db" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      </div>

      <p class="bm-card-text">${bm.text}</p>

      <div class="bm-card-foot">
        <button class="bm-play-btn" data-surah="${bm.surahId}" data-ayah="${bm.ayah}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          <span>استماع وتدبّر</span>
        </button>
        <span style="font-size: 12px; color: var(--color-text-tertiary);">${bm.timeAgo || 'محفوظ'}</span>
      </div>
    </article>
  `).join('');

  // ربط أحداث النقر عبر الكنترولر
  bindBookmarkEvents(grid, filterType, query, onPlayBookmark, renderBookmarksView);
}
