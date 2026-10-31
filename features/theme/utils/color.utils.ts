/**
 * رتل - Ratil
 * دوال تحويل الألوان والتعامل مع قيم RGB للـ CSS Variables
 * features/theme/utils/color.utils.ts
 */

/**
 * تحويل كود Hex (مثل #3ECFB2 أو #fff) إلى سلسلة أرقام RGB ("62 207 178")
 */
export function hexToRgbString(hex: string): string {
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  }

  const num = parseInt(cleaned, 16);
  if (isNaN(num)) return '0 0 0';

  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  return `${r} ${g} ${b}`;
}

/**
 * إنشاء كائن قيمة اللون بـ Hex و RGB معاً
 */
export function createColorValue(hex: string) {
  return {
    hex,
    rgb: hexToRgbString(hex),
  };
}
