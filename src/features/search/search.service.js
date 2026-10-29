/**
 * رتل - Ratil
 * خدمة البحث في فهارس الآيات القرآنية (Search Service)
 * src/features/search/search.service.js
 */

import { state } from '../../core/state.js';
import { loadJson } from '../../lib/api.js';

/**
 * البحث في متن الآيات بالرواية الحالية (حفص أو ورش)
 * @param {string} normQuery - نص الاستعلام بعد التطبيع
 * @param {number} maxResults - الحد الأقصى للنتائج
 * @returns {Promise<Array>}
 */
export async function searchAyahsInCurrentNarration(normQuery, maxResults = 8) {
  try {
    const filename = state.currentNarration === 'warsh'
      ? '/data/search_index_warsh.json'
      : '/data/search_index_hafs.json';
    const searchIndex = await loadJson(filename);

    const matches = [];
    for (const item of searchIndex) {
      if (item.norm && item.norm.includes(normQuery)) {
        matches.push(item);
        if (matches.length >= maxResults) break;
      }
    }
    return matches;
  } catch (e) {
    return [];
  }
}
