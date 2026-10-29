/**
 * رتل - Ratil
 * إدارة مساحة التخزين وحصص الذاكرة (Storage Quota & Persistent Storage)
 * src/features/audio-download/storage-quota.js
 */

/**
 * طلب تفعيل التخزين الدائم لمنع المتصفح (خاصة Safari iOS) من الحذف التلقائي
 * @returns {Promise<boolean>}
 */
export async function requestPersistentStorage() {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      return isPersisted;
    } catch (e) {
      console.warn('تعذر طلب Persistent Storage:', e);
      return false;
    }
  }
  return false;
}

/**
 * التحقق مما إذا كان الموقع يتمتع بتخزين دائم
 * @returns {Promise<boolean>}
 */
export async function isStoragePersisted() {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persisted) {
    try {
      return await navigator.storage.persisted();
    } catch (e) {
      return false;
    }
  }
  return false;
}

/**
 * حساب المساحة الإجمالية والمستهلكة للتطبيق
 * @returns {Promise<{quotaMB: number, usageMB: number, percentUsed: number, isPersisted: boolean}>}
 */
export async function getStorageQuotaEstimate() {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 1;
      const isPersisted = await isStoragePersisted();

      return {
        usageBytes: usage,
        quotaBytes: quota,
        usageMB: Math.round((usage / (1024 * 1024)) * 10) / 10,
        quotaMB: Math.round((quota / (1024 * 1024)) * 10) / 10,
        percentUsed: Math.min(100, Math.round((usage / quota) * 100)),
        isPersisted
      };
    } catch (e) {}
  }

  return {
    usageBytes: 0,
    quotaBytes: 0,
    usageMB: 0,
    quotaMB: 0,
    percentUsed: 0,
    isPersisted: false
  };
}

/**
 * تنسيق حجم البايتات إلى صيغة سهلة القراءة
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 ميجابايت';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1000) {
    const gb = mb / 1024;
    return `${gb.toFixed(1)} جيجابايت`;
  }
  return `${mb.toFixed(1)} ميجابايت`;
}
