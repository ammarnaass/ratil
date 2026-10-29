/**
 * رتل - Ratil
 * خادم الخدمة للتشغيل دون اتصال ومحرك تقطيع الصوتيات المتقدم
 * (Offline-First Service Worker with HTTP 206 Range Synthesizer)
 * public/sw.js
 */

const CACHE_NAME = 'ratil-cache-v3';
const AUDIO_CACHE_NAME = 'ratil-audio-cache-v1';

// الأصول الأساسية الثابتة المخزنة مسبقاً
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/src/styles/tokens.css',
  '/src/styles/app.css',
  '/src/app.js',
  '/src/core/state.js',
  '/src/core/storage.js',
  '/src/core/audio-player.js',
  '/src/features/verse-sync.js',
  '/src/features/verse-sync/index.js',
  '/src/features/verse-sync/verse-sync.engine.js',
  '/src/features/search.js',
  '/src/features/search/index.js',
  '/src/features/search/search.service.js',
  '/src/features/search/search.ui.js',
  '/src/features/bookmarks.js',
  '/src/features/bookmarks/index.js',
  '/src/features/bookmarks/bookmarks.view.js',
  '/src/features/bookmarks/bookmarks.controller.js',
  '/src/features/navigation.js',
  '/src/features/navigation/index.js',
  '/src/features/navigation/router.js',
  '/src/features/navigation/surah-viewer.js',
  '/src/features/navigation/reciter-picker.js',
  '/src/features/navigation/scroll-behavior.js',
  '/src/features/navigation/desktop-nav.js',
  '/src/features/navigation/global-listeners.js',
  '/src/features/audio-download/index.js',
  '/src/features/audio-download/storage-quota.js',
  '/src/features/audio-download/download-manager.js',
  '/src/features/audio-download/offline-audio-ui.js',
  '/src/ui/renderer.js',
  '/src/ui/theme.js',
  '/src/ui/toasts.js',
  '/src/lib/api.js',
  '/src/lib/normalize.js',
  '/public/fonts/hafs.woff2',
  '/public/fonts/warsh.woff2',
  '/data/surahs.json',
  '/audio-manifest/reciters.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Some assets could not be pre-cached:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          // الحفاظ التام على كاش الصوتيات المحملة ratil-audio-cache-v1
          if (key !== CACHE_NAME && key !== AUDIO_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/**
 * خريطة معرفات أرشيف الإنترنت للقرّاء المعتمدين
 */
const ARCHIVE_ITEMS_MAP = {
  'al-minshawy': 'ratil-quran-hafs-al-minshawy',
  'al-husary': 'ratil-quran-warsh-al-husary',
  'al-husary-warsh': 'ratil-quran-warsh-al-husary',
  'alafasy': 'ratil-quran-hafs-alafasy'
};

function getArchiveFallbackUrl(originalUrl) {
  try {
    const u = new URL(originalUrl);
    if (u.hostname === 'cdn.ratil.app') {
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts.length >= 3 && parts[0] === 'audio') {
        const reciter = parts[1];
        const filename = parts[2];
        const archiveItem = ARCHIVE_ITEMS_MAP[reciter] || `ratil-quran-${reciter}`;
        return `https://archive.org/download/${archiveItem}/${filename}`;
      }
    }
  } catch (e) {}
  return null;
}

/**
 * معالج تقطيع الصوتيات Range Request المتوافق مع متصفحات iOS Safari و Chrome
 * يقرأ الملف الكامل من الكاش ويصنع استجابة HTTP 206 Partial Content
 * مع ميزة التبديل الذاتي الصامت (Failover) إلى مرآة أرشيف الإنترنت
 */
async function handleAudioRequest(request) {
  const audioCache = await caches.open(AUDIO_CACHE_NAME);
  let response = await audioCache.match(request.url, { ignoreSearch: true });

  // إذا لم يكن الصوت متاحاً في الكاش المحلي، نجلبه من الشبكة مع الـ Failover
  if (!response) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const netRes = await fetch(request, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (netRes && (netRes.ok || netRes.status === 206)) {
        return netRes;
      }
      throw new Error(`Primary status: ${netRes?.status}`);
    } catch (primaryErr) {
      // الفشل أو البطء: محاولة الانتقال التلقائي لمرآة Archive.org
      const fallbackUrl = getArchiveFallbackUrl(request.url);
      if (fallbackUrl) {
        try {
          const fallbackHeaders = new Headers(request.headers);
          const fallbackReq = new Request(fallbackUrl, {
            headers: fallbackHeaders,
            mode: 'cors'
          });
          const fallbackRes = await fetch(fallbackReq);
          if (fallbackRes && (fallbackRes.ok || fallbackRes.status === 206)) {
            return fallbackRes;
          }
        } catch (fbErr) {
          console.warn('[SW-Audio] تعذر الجلب من مرآة الأرشيف:', fbErr);
        }
      }

      return new Response('Audio file unavailable offline. Please download first.', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  }

  // إذا كان في الكاش، نفحص ترويسة Range المطلوبة من قبل المشغل
  const rangeHeader = request.headers.get('Range');
  if (!rangeHeader) {
    return response;
  }

  const arrayBuffer = await response.arrayBuffer();
  const totalLength = arrayBuffer.byteLength;

  const parts = rangeHeader.replace(/bytes=/, '').split('-');
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : totalLength - 1;

  if (start >= totalLength || end >= totalLength) {
    return new Response(null, {
      status: 416,
      statusText: 'Range Not Satisfiable',
      headers: {
        'Content-Range': `bytes */${totalLength}`
      }
    });
  }

  const slicedData = arrayBuffer.slice(start, end + 1);

  return new Response(slicedData, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${totalLength}`,
      'Content-Length': String(slicedData.byteLength),
      'Accept-Ranges': 'bytes'
    }
  });
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // اعتراض ومعالجة ملفات الصوت (MP3 أو Opus أو نطاقات الاستضافة الصوتية وأرشيف الإنترنت)
  const isAudio = url.pathname.endsWith('.mp3') ||
                  url.pathname.endsWith('.opus') ||
                  url.hostname === 'cdn.ratil.app' ||
                  url.hostname.includes('archive.org') ||
                  url.hostname.includes('quranicaudio.com') ||
                  url.hostname.includes('everyayah.com');

  if (isAudio) {
    event.respondWith(handleAudioRequest(event.request));
    return;
  }

  // استراتيجية Cache-First للأصول الثابتة
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        if (url.pathname.endsWith('.json') || url.pathname.endsWith('.woff2') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
