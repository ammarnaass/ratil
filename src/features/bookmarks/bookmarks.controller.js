/**
 * رتل - Ratil
 * معالج تفاعلات المحفوظات والمفضلة (Bookmarks Controller)
 * src/features/bookmarks/bookmarks.controller.js
 */

import { state } from '../../core/state.js';
import { getBookmarks, saveBookmarks } from '../../core/storage.js';
import { showToast } from '../../ui/toasts.js';

/**
 * ربط أحداث البطاقات (تشغيل الآية وتبديل النجمة)
 * @param {HTMLElement} grid - حاوية بطاقات المحفوظات
 * @param {string} filterType
 * @param {string} query
 * @param {Function} onPlayBookmark
 * @param {Function} rerenderFn - دالة إعادة الرسم عند تحديث النجمة
 */
export function bindBookmarkEvents(grid, filterType, query, onPlayBookmark, rerenderFn) {
  // 1. زر الاستماع والتدبر
  grid.querySelectorAll('.bm-play-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sId = parseInt(btn.dataset.surah, 10);
      const aNum = parseInt(btn.dataset.ayah, 10);
      const surah = state.surahs.find(s => s.id === sId);
      if (surah && onPlayBookmark) {
        onPlayBookmark(surah, aNum);
      }
    });
  });

  // 2. زر تبديل النجمة المفضلة
  grid.querySelectorAll('.bm-card-star').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const all = await getBookmarks();
      const found = all.find(b => b.id === id);
      if (found) {
        found.type = found.type === 'starred' ? 'all' : 'starred';
        await saveBookmarks(all);
        if (rerenderFn) rerenderFn(filterType, query, onPlayBookmark);
        showToast(found.type === 'starred' ? 'تمت إضافة الآية للمفضلة ⭐' : 'تمت إزالة النجمة');
      }
    });
  });
}
