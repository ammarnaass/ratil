/**
 * رتل - Ratil
 * أدوات تحليل وتطبيع روابط ووسوم Archive.org
 * features/audio/utils/archive-parser.utils.ts
 */

import type { ParsedArchiveAudio } from '../types/audio.types';

const ARCHIVE_BASE = 'https://archive.org';

/**
 * تحليل أي مدخل متعلق بـ Archive.org (iframe, [archiveorg], url, itemId)
 * وتطبيعه إلى روابط مباشرة معتمدة وأكواد تضمين
 */
export function parseArchiveAudioInput(rawInput: string): ParsedArchiveAudio {
  const trimmed = (rawInput || '').trim();
  const defaultEmpty: ParsedArchiveAudio = {
    rawInput: trimmed,
    itemId: '',
    fileName: '',
    surahNumber: null,
    downloadUrl: '',
    embedUrl: '',
    detailsUrl: '',
    embedIframe: '',
    embedTag: '',
    isValid: false,
  };

  if (!trimmed) return defaultEmpty;

  let itemId = '';
  let fileName = '';

  // 1. فحص كود <iframe>
  const iframeSrcMatch = trimmed.match(/<iframe\s+[^>]*src=["']([^"']+)["'][^>]*>/i);
  const targetText = iframeSrcMatch ? iframeSrcMatch[1] : trimmed;

  // 2. فحص وسم الوصف [archiveorg ...]
  const tagMatch = targetText.match(/\[archiveorg\s+([^\/\s\]]+)(?:\/([^\/\s\]]+))?(?:\s+[^\]]*)?\]/i);
  if (tagMatch) {
    itemId = tagMatch[1];
    fileName = tagMatch[2] || '';
  } else {
    // 3. فحص روابط archive.org بمختلف مساراتها (embed, download, details, items)
    const urlMatch = targetText.match(
      /(?:https?:\/\/)?(?:www\.)?archive\.org\/(?:embed|download|details|items)\/([^\/\s"'?#]+)(?:\/([^\/\s"'?#]+))?/i
    );

    if (urlMatch) {
      itemId = urlMatch[1];
      fileName = urlMatch[2] || '';
    } else if (/^[a-zA-Z0-9_\-\.]+$/.test(targetText)) {
      // 4. معرّف مجرد بدون رابط
      itemId = targetText;
    }
  }

  // تنظيف القيم
  itemId = itemId.replace(/^[\\\/]+|[\\\/]+$/g, '').trim();
  fileName = fileName.replace(/^[\\\/]+|[\\\/]+$/g, '').trim();

  if (!itemId) {
    return {
      ...defaultEmpty,
      error: 'تعذر استخراج معرف المادة في أرشيف الإنترنت (Item Identifier)',
    };
  }

  // استنتاج رقم السورة من اسم الملف إن وجد (مثل 001.mp3 -> 1)
  let surahNumber: number | null = null;
  if (fileName) {
    const numMatch = fileName.match(/^0*([1-9]\d{0,2})(?:\.mp3|\.ogg|\.m4a)?$/i) || fileName.match(/(\d{1,3})/);
    if (numMatch) {
      const parsed = parseInt(numMatch[1], 10);
      if (parsed >= 1 && parsed <= 114) {
        surahNumber = parsed;
      }
    }
  }

  // بناء الروابط المعيارية
  const detailsUrl = `${ARCHIVE_BASE}/details/${itemId}`;
  const downloadUrl = fileName
    ? `${ARCHIVE_BASE}/download/${itemId}/${fileName}`
    : `${ARCHIVE_BASE}/download/${itemId}`;
  const embedUrl = fileName
    ? `${ARCHIVE_BASE}/embed/${itemId}/${fileName}`
    : `${ARCHIVE_BASE}/embed/${itemId}`;

  const embedIframe = `<iframe src="${embedUrl}" width="500" height="30" frameborder="0" webkitallowfullscreen="true" mozallowfullscreen="true" allowfullscreen></iframe>`;
  const embedTag = fileName
    ? `[archiveorg ${itemId}/${fileName} width=640 height=30 frameborder=0 webkitallowfullscreen=true mozallowfullscreen=true]`
    : `[archiveorg ${itemId} width=640 height=30 frameborder=0 webkitallowfullscreen=true mozallowfullscreen=true]`;

  return {
    rawInput: trimmed,
    itemId,
    fileName,
    surahNumber,
    downloadUrl,
    embedUrl,
    detailsUrl,
    embedIframe,
    embedTag,
    isValid: true,
  };
}

/**
 * استخراج معرف الأرشيف من رابط المصدر أو معرف القارئ
 */
export function extractArchiveItemId(sourceUrlOrId?: string | null, fallbackId?: string): string {
  if (!sourceUrlOrId && !fallbackId) return '';
  const parsed = parseArchiveAudioInput(sourceUrlOrId || '');
  if (parsed.isValid && parsed.itemId) {
    return parsed.itemId;
  }
  // إذا كان الرابط لا يحتوي على archive.org، نعتمد المعرف الافتراضي
  return fallbackId ? `ratil-${fallbackId}` : '';
}

/**
 * توليد رابط MP3 مباشر وموثوق لسورة معينة
 */
export function buildSurahDirectUrl(itemId: string, surahNumber: number): string {
  const pad = String(surahNumber).padStart(3, '0');
  return `${ARCHIVE_BASE}/download/${itemId}/${pad}.mp3`;
}
