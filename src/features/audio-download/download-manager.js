/**
 * رتل - Ratil
 * محرك تنزيل وإدارة الصوتيات دون اتصال (Audio Download Manager)
 * src/features/audio-download/download-manager.js
 */

import { getSurahAudioUrl } from '../../core/audio-player.js';
import {
  saveDownloadedSurah,
  removeDownloadedSurah,
  getDownloadedSurahs
} from '../../core/storage.js';
import { requestPersistentStorage } from './storage-quota.js';

export const AUDIO_CACHE_NAME = 'ratil-audio-cache-v1';

/**
 * تنزيل تلاوة سورة كاملة مع تتبع نسبة التقدم وحفظها في الكاش
 * @param {Object} reciter - كائن القارئ المعتمد
 * @param {Object} surah - كائن السورة
 * @param {Function} onProgress - رد النداء لتحديث النسبة المئوية (0 إلى 100)
 * @returns {Promise<Object>} سجل السورة المحملة
 */
export async function downloadSurahAudio(reciter, surah, onProgress = () => {}) {
  await requestPersistentStorage();

  const audioUrl = getSurahAudioUrl(reciter, surah.id);
  const cacheKey = `${reciter.id}_${surah.id}`;

  const response = await fetch(audioUrl);
  if (!response.ok) {
    throw new Error(`فشل الاتصال بمصدر الصوت (${response.status})`);
  }

  const contentLengthHeader = response.headers.get('content-length');
  const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;

  const reader = response.body.getReader();
  const chunks = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    receivedBytes += value.length;

    if (totalBytes > 0) {
      const pct = Math.round((receivedBytes / totalBytes) * 100);
      onProgress(Math.min(99, pct), receivedBytes, totalBytes);
    }
  }

  // دمج الأجزاء في كائن Blob متكامل
  const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });

  // حفظ الملف في CacheStorage مع ترويسات الدعم للـ Range Requests
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const cachedResponse = new Response(audioBlob, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': String(audioBlob.size),
      'Accept-Ranges': 'bytes'
    }
  });

  await cache.put(audioUrl, cachedResponse);

  const downloadRecord = {
    id: cacheKey,
    surahId: surah.id,
    surahNameAr: surah.name_ar,
    reciterId: reciter.id,
    reciterNameAr: reciter.name_ar,
    narration: reciter.narration,
    narrationAr: reciter.narration_ar,
    audioUrl,
    sizeBytes: audioBlob.size,
    downloadedAt: Date.now(),
    status: 'completed'
  };

  await saveDownloadedSurah(downloadRecord);
  onProgress(100, audioBlob.size, audioBlob.size);

  return downloadRecord;
}

/**
 * حذف تلاوة سورة من الكاش المحلي واسترجاع مساحة التخزين
 * @param {string} reciterId
 * @param {number} surahId
 */
export async function deleteDownloadedSurahAudio(reciterId, surahId) {
  const cacheKey = `${reciterId}_${surahId}`;
  const list = await getDownloadedSurahs();
  const found = list.find(r => r.id === cacheKey);

  if (typeof caches !== 'undefined') {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    if (found && found.audioUrl) {
      await cache.delete(found.audioUrl);
    }
  }

  await removeDownloadedSurah(cacheKey);
}

/**
 * التحقق مما إذا كانت تلاوة السورة محملة وجاهزة للأوفلاين
 * @param {string} reciterId
 * @param {number} surahId
 * @returns {Promise<boolean>}
 */
export async function isSurahAudioCached(reciterId, surahId) {
  const cacheKey = `${reciterId}_${surahId}`;
  const list = await getDownloadedSurahs();
  return list.some(r => r.id === cacheKey);
}

/**
 * جلب جميع السور الصوتية المحملة
 * @returns {Promise<Array>}
 */
export async function getAllDownloadedSurahs() {
  return await getDownloadedSurahs();
}
