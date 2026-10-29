/**
 * رتل - Ratil
 * محرك الهوية المشفرة محلياً والمزامنة الصامتة (Zero-Knowledge Sync Engine)
 * src/core/sync-identity.js
 * 
 * المبادئ الحاكمة:
 * 1. لا تسجيل بريد إلكتروني، لا كلمات مرور، ولا خوادم هوية مركزية.
 * 2. التشفير الكامل من طرف العميل (Client-Side Encryption via Web Crypto API - AES-GCM-256).
 * 3. المزامنة والنسخ الاحتياطي عبر كود المزامنة البشري أو ملف JSON محلي.
 */

const SYNC_CODE_KEY = 'ratil_sync_code_v1';
const SYNC_RELAY_URL = 'https://sync.ratil.app/api/sync';

/**
 * الحصول على واجهة crypto القياسية (متوافقة مع المتصفح وNode.js الحديث)
 */
function getCrypto() {
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto;
  }
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto;
  }
  throw new Error('Web Crypto API غير متوفرة في بيئة التشغيل الحالية.');
}

/**
 * 1. توليد كود مزامنة بشري سهل القراءة (16 حرفاً مقسمة لـ 4 مقاطع)
 * مثال: RTL7-8K2A-9MP4-XW32
 */
export function generateReadableSyncCode() {
  const cryptoObj = getCrypto();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // استبعاد الحروف المتشابهة (O, 0, I, 1)
  const bytes = new Uint8Array(16);
  cryptoObj.getRandomValues(bytes);
  
  let code = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

/**
 * 2. اشتقاق مفتاح تشفير ومفتاح بحث أعمى للخادم من كود المزامنة
 */
export async function deriveKeysFromSyncCode(syncCode) {
  const cryptoObj = getCrypto();
  const subtle = cryptoObj.subtle;
  const enc = new TextEncoder();
  const normalizedCode = syncCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

  const rawKeyMaterial = await subtle.importKey(
    'raw',
    enc.encode(normalizedCode),
    { name: 'PBKDF2' },
    false,
    ['deriveKey', 'deriveBits']
  );

  // مفتاح التشفير المتماثل للبيانات (AES-GCM 256)
  const encryptionKey = await subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('ratil-quran-encryption-salt-v1'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    rawKeyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  // مفتاح الفهرسة الأعمى للخادم (Blind Storage Key Hash) - لا يكشف كود المزامنة إطلاقاً
  const blindStorageHashBits = await subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode('ratil-blind-storage-hash-salt-v1'),
      iterations: 50000,
      hash: 'SHA-256'
    },
    rawKeyMaterial,
    256
  );

  const storageKey = Array.from(new Uint8Array(blindStorageHashBits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return { encryptionKey, storageKey };
}

/**
 * 3. تشفير بيانات المستخدم (العلامات المرجعية، موضع الاستماع، الإعدادات)
 */
export async function encryptUserData(syncCode, plainUserData) {
  const cryptoObj = getCrypto();
  const { encryptionKey, storageKey } = await deriveKeysFromSyncCode(syncCode);
  const iv = cryptoObj.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const payloadStr = JSON.stringify(plainUserData);

  const cipherBuffer = await cryptoObj.subtle.encrypt(
    { name: 'AES-GCM', iv },
    encryptionKey,
    enc.encode(payloadStr)
  );

  // دمج الـ IV بطول 12 بايت في بداية الشفرة
  const combined = new Uint8Array(iv.length + cipherBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuffer), iv.length);

  // تحويل البايتات إلى Base64
  let binaryStr = '';
  for (let i = 0; i < combined.length; i++) {
    binaryStr += String.fromCharCode(combined[i]);
  }
  const encryptedBase64 = typeof btoa === 'function' ? btoa(binaryStr) : Buffer.from(binaryStr, 'binary').toString('base64');

  return {
    storageKey,
    encryptedBase64,
    timestamp: Date.now()
  };
}

/**
 * 4. فك تشفير بيانات المستخدم باستخدام كود المزامنة
 */
export async function decryptUserData(syncCode, encryptedBase64) {
  const cryptoObj = getCrypto();
  const { encryptionKey } = await deriveKeysFromSyncCode(syncCode);

  const binaryStr = typeof atob === 'function' ? atob(encryptedBase64) : Buffer.from(encryptedBase64, 'base64').toString('binary');
  const combined = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    combined[i] = binaryStr.charCodeAt(i);
  }

  const iv = combined.slice(0, 12);
  const cipherData = combined.slice(12);

  const decryptedBuffer = await cryptoObj.subtle.decrypt(
    { name: 'AES-GCM', iv },
    encryptionKey,
    cipherData
  );

  const dec = new TextDecoder();
  return JSON.parse(dec.decode(decryptedBuffer));
}

/**
 * 5. استرجاع أو إنشاء كود المزامنة المحلي للجهاز الحالي
 */
export function getOrInitLocalSyncCode() {
  if (typeof localStorage === 'undefined') return generateReadableSyncCode();
  let code = localStorage.getItem(SYNC_CODE_KEY);
  if (!code) {
    code = generateReadableSyncCode();
    localStorage.setItem(SYNC_CODE_KEY, code);
  }
  return code;
}

/**
 * 6. تعيين كود مزامنة جديد (عند الربط بجهاز آخر)
 */
export function setLocalSyncCode(newCode) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(SYNC_CODE_KEY, newCode.trim().toUpperCase());
  }
}

/**
 * 7. تجميع كافة بيانات المستخدم المحلية لحزمها في النسخة الاحتياطية أو المزامنة
 */
export function collectLocalUserData() {
  const data = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    bookmarks: [],
    lastSession: null,
    settings: {
      riwaya: 'hafs',
      theme: 'dark'
    }
  };

  if (typeof localStorage !== 'undefined') {
    try {
      const bm = localStorage.getItem('ratil_bookmarks');
      if (bm) data.bookmarks = JSON.parse(bm);
    } catch (e) {}

    try {
      const sess = localStorage.getItem('ratil_last_session');
      if (sess) data.lastSession = JSON.parse(sess);
    } catch (e) {}

    try {
      const reciter = localStorage.getItem('ratil_last_reciter');
      if (reciter) data.settings.lastReciter = reciter;
    } catch (e) {}
  }

  return data;
}

/**
 * 8. تطبيق بيانات المستخدم المستوردة على التخزين المحلي
 */
export function applyLocalUserData(userData) {
  if (!userData || typeof localStorage === 'undefined') return false;

  if (Array.isArray(userData.bookmarks)) {
    localStorage.setItem('ratil_bookmarks', JSON.stringify(userData.bookmarks));
  }
  if (userData.lastSession) {
    localStorage.setItem('ratil_last_session', JSON.stringify(userData.lastSession));
  }
  if (userData.settings?.lastReciter) {
    localStorage.setItem('ratil_last_reciter', userData.settings.lastReciter);
  }
  return true;
}

/**
 * 9. تصدير ملف النسخة الاحتياطية المحلي بضغطة زر (JSON)
 */
export function exportBackupFile(userData = null) {
  const payload = userData || collectLocalUserData();
  const jsonStr = JSON.stringify(payload, null, 2);

  if (typeof document !== 'undefined') {
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ratil-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return jsonStr;
}

/**
 * 10. استيراد ملف النسخة الاحتياطية
 */
export function importBackupFile(fileOrString) {
  return new Promise((resolve, reject) => {
    if (typeof fileOrString === 'string') {
      try {
        const parsed = JSON.parse(fileOrString);
        applyLocalUserData(parsed);
        resolve(parsed);
      } catch (err) {
        reject(new Error('ملف النسخة الاحتياطية غير صالح أو تالف.'));
      }
      return;
    }

    if (typeof FileReader !== 'undefined' && fileOrString instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          applyLocalUserData(parsed);
          resolve(parsed);
        } catch (err) {
          reject(new Error('ملف النسخة الاحتياطية غير صالح أو تالف.'));
        }
      };
      reader.onerror = () => reject(new Error('فشل قراءة الملف.'));
      reader.readAsText(fileOrString);
      return;
    }

    reject(new Error('نوع البيانات غير مدعوم للاستيراد.'));
  });
}
