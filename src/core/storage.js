/**
 * رتل - Ratil
 * طبقة التخزين المزدوجة (IndexedDB للمحفوظات + localStorage للإعدادات)
 * src/core/storage.js
 */

const DB_NAME = 'ratil_db';
const DB_VERSION = 2;
const STORE_BOOKMARKS = 'bookmarks';
const STORE_DOWNLOADS = 'downloaded_surahs';

let dbInstance = null;

// قائمة المحفوظات الافتراضية الأولية
export const defaultBookmarks = [
  {
    id: 'bm-1',
    surahId: 19,
    surahName: 'سورة مريم',
    ayah: 96,
    type: 'starred',
    text: 'إِنَّ ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ سَيَجْعَلُ لَهُمُ ٱلرَّحْمَٰنُ وُدًّا',
    reciter: 'الشيخ محمد صديق المنشاوي',
    meta: 'الجزء ١٦ · صفحة ٣١٢ · مكية',
    timeAgo: 'منذ يومين'
  },
  {
    id: 'bm-2',
    surahId: 20,
    surahName: 'سورة طه',
    ayah: 1,
    type: 'starred',
    text: 'طه ﴿١﴾ مَآ أَنزَلْنَا عَلَيْكَ ٱلْقُرْءَانَ لِتَشْقَىٰٓ ﴿٢﴾ إِلَّا تَذْكِرَةً لِّمَن يَخْشَىٰ ﴿٣﴾',
    reciter: 'الشيخ محمود خليل الحصري',
    meta: 'الجزء ١٦ · صفحة ٣١٢ · مكية',
    timeAgo: 'منذ ٣ أيام'
  },
  {
    id: 'bm-3',
    surahId: 55,
    surahName: 'سورة الرحمن',
    ayah: 1,
    type: 'audio',
    text: 'ٱلرَّحْمَٰنُ ﴿١﴾ عَلَّمَ ٱلْقُرْءَانَ ﴿٢﴾ خَلَقَ ٱلْإِنسَٰنَ ﴿٣﴾ عَلَّمَهُ ٱلْبَيَانَ ﴿٤﴾',
    reciter: 'الشيخ عبد الباسط عبد الصمد',
    meta: 'الجزء ٢٧ · صفحة ٥٣١ · مدنية',
    timeAgo: 'منذ ٥ أيام'
  },
  {
    id: 'bm-4',
    surahId: 12,
    surahName: 'سورة يوسف',
    ayah: 21,
    type: 'khatmah',
    text: 'وَٱللَّهُ غَالِبٌ عَلَىٰٓ أَمْرِهِۦ وَلَٰكِنَّ أَكْثَرَ ٱلنَّاسِ لَا يَعْلَمُونَ',
    reciter: 'الشيخ محمد صديق المنشاوي',
    meta: 'الجزء ١٢ · صفحة ٢٣٧ · مكية',
    timeAgo: 'منذ أسبوع'
  }
];

/**
 * تهيئة قاعدة بيانات IndexedDB
 */
export function initDB() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      resolve(null);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_BOOKMARKS)) {
        db.createObjectStore(STORE_BOOKMARKS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_DOWNLOADS)) {
        db.createObjectStore(STORE_DOWNLOADS, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      console.warn('تعذر فتح IndexedDB، سيتم استخدام التخزين البديل.');
      resolve(null);
    };
  });
}

/**
 * جلب جميع المحفوظات
 * @returns {Promise<Array>}
 */
export async function getBookmarks() {
  try {
    const raw = localStorage.getItem('ratil_bookmarks');
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  return defaultBookmarks;
}

/**
 * حفظ قائمة المحفوظات
 * @param {Array} bookmarks
 */
export async function saveBookmarks(bookmarks) {
  try {
    localStorage.setItem('ratil_bookmarks', JSON.stringify(bookmarks));
  } catch (e) {}

  if (dbInstance) {
    try {
      const tx = dbInstance.transaction(STORE_BOOKMARKS, 'readwrite');
      const store = tx.objectStore(STORE_BOOKMARKS);
      store.clear();
      bookmarks.forEach(bm => store.put(bm));
    } catch (err) {
      console.warn('خطأ أثناء حفظ المحفوظات في IndexedDB:', err);
    }
  }
}

/**
 * استرجاع آخر جلسة استماع
 */
export function loadSession() {
  try {
    const raw = localStorage.getItem('ratil_last_session');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

/**
 * حفظ جلسة الاستماع الحالية
 * @param {Object} session
 */
export function saveSession(session) {
  try {
    localStorage.setItem('ratil_last_session', JSON.stringify(session));
  } catch (e) {}
}

/**
 * جلب قائمة السور الصوتية المحملة دون اتصال
 * @returns {Promise<Array>}
 */
export async function getDownloadedSurahs() {
  if (dbInstance) {
    try {
      return new Promise((resolve) => {
        const tx = dbInstance.transaction(STORE_DOWNLOADS, 'readonly');
        const store = tx.objectStore(STORE_DOWNLOADS);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch (e) {}
  }
  try {
    const raw = localStorage.getItem('ratil_downloads');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * حفظ أو تحديث سجل سورة صوتية محملة
 * @param {Object} record
 */
export async function saveDownloadedSurah(record) {
  try {
    const list = await getDownloadedSurahs();
    const idx = list.findIndex(r => r.id === record.id);
    if (idx >= 0) list[idx] = record;
    else list.push(record);
    localStorage.setItem('ratil_downloads', JSON.stringify(list));
  } catch (e) {}

  if (dbInstance) {
    try {
      const tx = dbInstance.transaction(STORE_DOWNLOADS, 'readwrite');
      tx.objectStore(STORE_DOWNLOADS).put(record);
    } catch (err) {
      console.warn('تعذر حفظ سجل التنزيل في IndexedDB:', err);
    }
  }
}

/**
 * حذف سجل سورة محملة
 * @param {string} recordId
 */
export async function removeDownloadedSurah(recordId) {
  try {
    const list = await getDownloadedSurahs();
    const filtered = list.filter(r => r.id !== recordId);
    localStorage.setItem('ratil_downloads', JSON.stringify(filtered));
  } catch (e) {}

  if (dbInstance) {
    try {
      const tx = dbInstance.transaction(STORE_DOWNLOADS, 'readwrite');
      tx.objectStore(STORE_DOWNLOADS).delete(recordId);
    } catch (err) {}
  }
}
