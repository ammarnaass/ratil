/**
 * رتل - Ratil
 * واجهة وعناصر البحث المنسدلة (Search UI Component)
 * src/features/search/search.ui.js
 */

import { state } from '../../core/state.js';
import { normalizeQuranSearchText, toIndicDigits } from '../../lib/normalize.js';
import { searchAyahsInCurrentNarration } from './search.service.js';

/**
 * معالجة حقل البحث وعرض النتائج المباشرة في القائمة المنسدلة
 * @param {string} query
 * @param {Function} onSelectResult - رد النداء عند اختيار نتيجة (سورة أو آية)
 */
export function handleSearch(query, onSelectResult) {
  const cleanQ = query.trim();
  const dropdown = document.getElementById('search-dropdown');
  if (!dropdown) return;

  if (!cleanQ) {
    dropdown.classList.remove('active');
    dropdown.innerHTML = '';
    return;
  }

  const normQ = normalizeQuranSearchText(cleanQ);
  const numQ = parseInt(cleanQ, 10);

  // مطابقة السور بالاسم أو الرقم
  const matchedSurahs = state.surahs.filter(s => {
    if (s.id === numQ) return true;
    const normAr = normalizeQuranSearchText(s.name_ar);
    if (normAr.includes(normQ)) return true;
    if (s.name_en && s.name_en.toLowerCase().includes(cleanQ.toLowerCase())) return true;
    return false;
  }).slice(0, 5);

  let html = '';

  if (matchedSurahs.length > 0) {
    html += matchedSurahs.map(s => `
      <div class="search-result-item" data-type="surah" data-surah-id="${s.id}">
        <div class="search-result-top">
          <span class="search-result-surah">سورة ${s.name_ar}</span>
          <span class="search-result-aya">${s.type} · ${s.ayahs_hafs} آية</span>
        </div>
        <div class="search-result-text">فتح السورة والبدء من الآية الأولى</div>
      </div>
    `).join('');
  }

  // البحث في متن الآيات
  searchAyahsInCurrentNarration(normQ).then(matchedAyahs => {
    if (matchedAyahs.length > 0) {
      html += matchedAyahs.map(a => `
        <div class="search-result-item" data-type="ayah" data-surah-id="${a.surah_id}" data-aya="${a.aya}">
          <div class="search-result-top">
            <span class="search-result-surah">سورة ${a.surah_name}</span>
            <span class="search-result-aya">الآية ${toIndicDigits(a.aya)}</span>
          </div>
          <div class="search-result-text">${a.text}</div>
        </div>
      `).join('');
    }

    if (!html) {
      html = `<div style="padding: 16px; text-align: center; color: var(--color-text-muted);">لا توجد نتائج مطابقة لـ "${query}"</div>`;
    }

    dropdown.innerHTML = html;
    dropdown.classList.add('active');

    // تفعيل النقر على نتائج البحث
    dropdown.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const surahId = parseInt(item.dataset.surahId, 10);
        const surah = state.surahs.find(s => s.id === surahId);
        const ayaNum = parseInt(item.dataset.aya, 10) || 1;

        dropdown.classList.remove('active');
        const input = document.getElementById('search-input');
        if (input) input.value = '';

        if (surah && onSelectResult) {
          onSelectResult(surah, ayaNum);
        }
      });
    });
  });
}
