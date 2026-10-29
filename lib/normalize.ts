/**
 * رتل - Ratil
 * دوال تطبيع ومعالجة النصوص القرآنية والعربية
 * lib/normalize.ts
 */

/**
 * إزالة التشكيل وحركات الضبط القرآني
 */
export function removeTashkeel(text: string): string {
  if (!text) return '';
  return text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
}

/**
 * تطبيع النص العربي للبحث السريع والمرن
 * - توحيد الهمزات (أ, إ, آ, ٱ -> ا)
 * - توحيد الياء والألف المقصورة (ى -> ي)
 * - توحيد التاء المربوطة (ة -> ه)
 * - إزالة التطويل والكشيدة (ـ)
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return removeTashkeel(text)
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ـ/g, '')
    .trim();
}

/**
 * تحويل الأرقام الإنجليزية إلى أرقام عربية مشرقية والعكس
 */
export function toArabicDigits(num: number | string): string {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, w => digits[+w]);
}

export function toLatinDigits(str: string): string {
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  return String(str).replace(/[٠-٩]/g, d => String(arabicDigits.indexOf(d)));
}
