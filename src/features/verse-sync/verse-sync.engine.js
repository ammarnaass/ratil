/**
 * رتل - Ratil
 * محرك التزامن الدقيق للآيات (Millisecond-Precision Verse Synchronization)
 * مع خوارزمية البحث الثنائي Binary Search O(log N)
 * src/features/verse-sync/verse-sync.engine.js
 */

export class VerseSyncEngine {
  /**
   * @param {Array<{aya: number, start_ms: number, end_ms: number}>} timings - مصفوفة التوقيت بالمللي ثانية
   * @param {number} totalAyahs - إجمالي آيات السورة
   */
  constructor(timings = [], totalAyahs = 0) {
    this.timings = Array.isArray(timings) ? timings : [];
    this.totalAyahs = totalAyahs;
  }

  /**
   * تحديث مصفوفة التوقيت
   * @param {Array} timings
   * @param {number} totalAyahs
   */
  setTimings(timings, totalAyahs = 0) {
    this.timings = Array.isArray(timings) ? timings : [];
    if (totalAyahs > 0) {
      this.totalAyahs = totalAyahs;
    }
  }

  /**
   * هل تتوفر بيانات توقيت دقيقة؟
   * @returns {boolean}
   */
  hasTimings() {
    return this.timings.length > 0;
  }

  /**
   * إيجاد الآية النشطة الحالية بناءً على التوقيت الزمني
   * @param {number} currentTimeSec - الوقت الحالي بالثواني
   * @param {number} durationSec - إجمالي مدة الصوت بالثواني
   * @param {number} totalAyahsFallback - عدد الآيات الكلي كحل بديل
   * @returns {number} رقم الآية النشطة (1-based)
   */
  getActiveAyah(currentTimeSec, durationSec, totalAyahsFallback = 0) {
    const total = this.totalAyahs || totalAyahsFallback || 1;

    // 1. إذا توفرت بيانات التوقيت الموثقة: البحث الثنائي Binary Search O(log N)
    if (this.timings.length > 0) {
      const currentTimeMs = Math.round(currentTimeSec * 1000);
      let low = 0;
      let high = this.timings.length - 1;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const segment = this.timings[mid];

        const start = segment.start_ms !== undefined ? segment.start_ms : segment.start_time;
        const end = segment.end_ms !== undefined ? segment.end_ms : segment.end_time;
        const ayaNum = segment.aya !== undefined ? segment.aya : segment.ayah;

        if (currentTimeMs >= start && currentTimeMs <= end) {
          return ayaNum;
        }

        if (currentTimeMs < start) {
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }

      // إذا تجاوز الوقت آخر آية
      if (low >= this.timings.length) {
        const lastSeg = this.timings[this.timings.length - 1];
        return lastSeg.aya || lastSeg.ayah || total;
      }

      // إذا كان الوقت قبل أول آية (الاستعاذة/البسملة)
      return this.timings[0].aya || this.timings[0].ayah || 1;
    }

    // 2. Fallback: التقدير النسبي إذا لم تتوفر مصفوفة توقيت بعد
    if (!durationSec || durationSec <= 0) return 1;
    const fraction = currentTimeSec / durationSec;
    return Math.min(total, Math.max(1, Math.floor(fraction * total) + 1));
  }
}
