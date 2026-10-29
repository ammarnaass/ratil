/**
 * رتل - Ratil
 * مكون واجهة تنزيل وعرض حالة الصوتيات دون اتصال (Offline Audio UI Component)
 * src/features/audio-download/offline-audio-ui.js
 */

import { showToast } from '../../ui/toasts.js';
import {
  downloadSurahAudio,
  deleteDownloadedSurahAudio,
  isSurahAudioCached
} from './download-manager.js';
import { formatBytes } from './storage-quota.js';

/**
 * تحديث الحالة المرئية لزر التنزيل (جاهز، قيد التنزيل، مكتمل)
 * @param {HTMLElement} btn
 * @param {'idle' | 'downloading' | 'downloaded'} status
 * @param {number} percent
 */
export function updateDownloadButtonVisuals(btn, status, percent = 0) {
  if (!btn) return;

  btn.dataset.downloadStatus = status;

  if (status === 'downloaded') {
    btn.classList.add('is-downloaded');
    btn.classList.remove('is-downloading');
    btn.title = 'التلاوة متاحة دون اتصال (انقر للحذف واستعادة المساحة)';
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3ECFB2" stroke-width="2.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span class="offline-ready-dot"></span>
    `;
  } else if (status === 'downloading') {
    btn.classList.add('is-downloading');
    btn.classList.remove('is-downloaded');
    btn.title = `جارٍ تنزيل التلاوة: ${percent}%`;
    btn.innerHTML = `
      <span class="download-pct-badge">${percent}%</span>
    `;
  } else {
    btn.classList.remove('is-downloaded', 'is-downloading');
    btn.title = 'تحميل التلاوة للاستماع دون اتصال';
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
    `;
  }
}

/**
 * تهيئة وربط تفاعلات زر تنزيل التلاوة في شاشة السورة
 * @param {HTMLElement} btn
 * @param {Function} getStateFn - دالة للحصول على { surah, reciter } الحالية
 */
export async function setupSurahDownloadButton(btn, getStateFn) {
  if (!btn) return;

  // تحديث الحالة الأولية عند فتح السورة
  const refreshStatus = async () => {
    const { surah, reciter } = getStateFn();
    if (!surah || !reciter) return;

    const isCached = await isSurahAudioCached(reciter.id, surah.id);
    updateDownloadButtonVisuals(btn, isCached ? 'downloaded' : 'idle');
  };

  btn.addEventListener('click', async (e) => {
    e.stopPropagation();
    const { surah, reciter } = getStateFn();
    if (!surah || !reciter) return;

    const currentStatus = btn.dataset.downloadStatus;

    if (currentStatus === 'downloading') {
      showToast('جارٍ تنزيل التلاوة بالفعل، يُرجى الانتظار...');
      return;
    }

    if (currentStatus === 'downloaded') {
      const ok = confirm(`هل تود حذف تلاوة سورة ${surah.name_ar} بصوت ${reciter.name_ar} من الذاكرة المحلية واستعادة المساحة؟`);
      if (ok) {
        await deleteDownloadedSurahAudio(reciter.id, surah.id);
        updateDownloadButtonVisuals(btn, 'idle');
        showToast(`تم حذف تلاوة سورة ${surah.name_ar} وتفريغ المساحة بنجاح.`);
      }
      return;
    }

    // بدء التنزيل
    updateDownloadButtonVisuals(btn, 'downloading', 0);
    showToast(`بدأ تحميل سورة ${surah.name_ar} للاستماع دون اتصال...`);

    try {
      const record = await downloadSurahAudio(reciter, surah, (pct) => {
        updateDownloadButtonVisuals(btn, 'downloading', pct);
      });

      updateDownloadButtonVisuals(btn, 'downloaded');
      const sizeStr = formatBytes(record.sizeBytes);
      showToast(`✓ اكتمل تحميل سورة ${surah.name_ar} (${sizeStr}) — متاحة الآن بدون إنترنت.`);
    } catch (err) {
      console.error('فشل تنزيل الصوت:', err);
      updateDownloadButtonVisuals(btn, 'idle');
      showToast('تعذر تنزيل ملف التلاوة، يرجى التحقق من اتصال الإنترنت.');
    }
  });

  return { refreshStatus };
}
