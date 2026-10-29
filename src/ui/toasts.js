/**
 * رتل - Ratil
 * موديول الإشعارات والتنبيهات الخفيفة
 * src/ui/toasts.js
 */

let toastTimer = null;

/**
 * إظهار إشعار Toast سريع على الشاشة
 * @param {string} msg - نص الرسالة
 * @param {number} duration - مدة العرض بالمللي ثانية
 */
export function showToast(msg, duration = 3200) {
  const toast = document.getElementById('toast-notice');
  if (!toast) return;

  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show', 'active');

  toastTimer = setTimeout(() => {
    toast.classList.remove('show', 'active');
  }, duration);
}
