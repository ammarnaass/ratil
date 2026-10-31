/**
 * رتل - Ratil
 * دوال مساعدة نقية خاصة بمشغّل الصوتيات (Pure Helpers)
 * features/player/utils/player.utils.ts
 */

import { ARCHIVE_DOWNLOAD_BASE_URL } from '../constants/player.constants';
import type { Reciter } from '@/lib/types';
import { extractArchiveItemId } from '@/features/audio';

/**
 * تنسيق الوقت بالثواني إلى صيغة الدقائق والثواني (00:00)
 */
export function formatTime(secs: number): string {
  if (isNaN(secs) || secs < 0) return '٠٠:٠٠';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  const padM = String(m).padStart(2, '0');
  const padS = String(s).padStart(2, '0');
  return `${padM}:${padS}`;
}

/**
 * بناء الرابط الصوتي المباشر للسورة من Archive.org
 * يدعم المعرفات المخصصة للأرشيف (مثل 483568356837_gmail_001) والروابط المخزنة
 */
export function getSurahAudioUrl(
  reciterOrId: Reciter | string,
  surahId: number,
  reciterSourceUrl?: string | null
): string {
  const padSurah = String(surahId).padStart(3, '0');

  // إذا تم تمرير كائن Reciter كامل
  if (typeof reciterOrId === 'object' && reciterOrId !== null) {
    // 1. إذا كانت السورة محملة برابط مباشر صالح في surahs
    const foundSurah = reciterOrId.surahs?.find((s) => s.surah_number === surahId);
    if (foundSurah?.audio_url && foundSurah.audio_url.includes('/download/')) {
      return foundSurah.audio_url;
    }

    // 2. استخراج معرف الأرشيف من source_url أو id
    const archiveId = extractArchiveItemId(reciterOrId.source_url, reciterOrId.id);
    return `${ARCHIVE_DOWNLOAD_BASE_URL}/${archiveId || `ratil-${reciterOrId.id}`}/${padSurah}.mp3`;
  }

  // إذا تم تمرير معرف القارئ كنص
  const archiveId = extractArchiveItemId(reciterSourceUrl, reciterOrId);
  return `${ARCHIVE_DOWNLOAD_BASE_URL}/${archiveId || `ratil-${reciterOrId}`}/${padSurah}.mp3`;
}

/**
 * استخراج نص شارة الرواية القرآنية
 */
export function getRiwayaBadge(riwaya?: string): string {
  switch (riwaya) {
    case 'warsh':
      return 'ورش عن نافع';
    case 'qalon':
      return 'قالون عن نافع';
    default:
      return 'حفص عن عاصم';
  }
}
