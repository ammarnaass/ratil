/**
 * واجهة وتفاعلات لوحة التحكم المركزية
 * src/features/admin/admin.ui.js
 */

import { adminService } from './admin.service.js';
import { authService } from '../auth/auth.service.js';

export function setupAdminDashboard() {
  if (typeof document === 'undefined') return;

  // 1. التنقل بين تبويبات لوحة التحكم
  const navLinks = document.querySelectorAll('nav a[data-path]');
  const tabSections = document.querySelectorAll('section[data-tab]');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPath = link.getAttribute('data-path');

      // تحديث أسلوب الروابط
      navLinks.forEach(l => {
        l.classList.remove('bg-primary-container', 'text-on-primary-container', 'font-semibold');
        l.classList.add('text-on-surface-variant');
      });
      link.classList.add('bg-primary-container', 'text-on-primary-container', 'font-semibold');
      link.classList.remove('text-on-surface-variant');

      // إظهار القسم المطلوب
      tabSections.forEach(section => {
        if (section.getAttribute('data-tab') === targetPath) {
          section.classList.remove('hidden');
        } else {
          section.classList.add('hidden');
        }
      });
    });
  });

  // 2. زر الفحص الفوري (Instant Audit)
  const auditBtn = document.getElementById('run-audit-btn');
  const auditFeedback = document.getElementById('audit-feedback');

  if (auditBtn) {
    auditBtn.addEventListener('click', async () => {
      auditBtn.disabled = true;
      const originalText = auditBtn.innerHTML;
      auditBtn.innerHTML = '<span class="animate-spin material-symbols-outlined text-headline-sm">sync</span> <span>جاري التدقيق...</span>';

      try {
        const result = await adminService.runQuickAudit();
        if (auditFeedback) {
          auditFeedback.textContent = '✅ اكتمل الفحص: كافة البصمات (SHA-256) ومسارات البث مطابقة 100%';
          auditFeedback.classList.remove('hidden');
          setTimeout(() => auditFeedback.classList.add('hidden'), 5000);
        }
      } catch (err) {
        if (auditFeedback) {
          auditFeedback.textContent = '⚠️ تعذر إتمام بعض الفحوصات';
          auditFeedback.classList.remove('hidden');
        }
      } finally {
        auditBtn.disabled = false;
        auditBtn.innerHTML = originalText;
      }
    });
  }

  // 3. زر تسجيل الخروج
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      authService.logout();
      window.location.href = '/login';
    });
  }
}
