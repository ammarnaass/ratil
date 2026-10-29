/**
 * رتل - Ratil
 * موديول جلب البيانات المعتمدة
 * src/lib/api.js
 */

/**
 * تحميل ملف JSON موحد وسريع
 * @param {string} path - مسار المورد (مثال: '/data/surahs.json')
 * @returns {Promise<any>}
 */
export async function loadJson(path) {
  // توحيد المسار الأساسي
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // في بيئة المتصفح الثابتة، نبحث أولاً في المسار المباشر ثم مسار public إذا لزم الأمر
  try {
    const res = await fetch(normalizedPath);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // محاولة المسار النسبي إذا كان الخادم يخدم من مجلد فرعي
  }

  // محاولة عبر بادئة public/ إذا كان الخادم المحلي لا يعيد التوجيه
  const publicPath = normalizedPath.startsWith('/public') ? normalizedPath : `/public${normalizedPath}`;
  const fallbackRes = await fetch(publicPath);
  if (!fallbackRes.ok) {
    throw new Error(`تعذر تحميل المورد: ${path} (كود الحالة: ${fallbackRes.status})`);
  }
  return await fallbackRes.json();
}
