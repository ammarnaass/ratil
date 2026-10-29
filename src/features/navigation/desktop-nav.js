/**
 * رتل - Ratil
 * مستمعات شاشات الديسكتوب والنوافذ المنبثقة (Desktop Navigation & Modals)
 * src/features/navigation/desktop-nav.js
 */

import { state } from '../../core/state.js';
import { showToast } from '../../ui/toasts.js';
import { renderBrowseSurahGrid, renderRecitersFullGrid } from '../../ui/renderer.js';
import { renderBookmarksView } from '../bookmarks/index.js';
import { switchView } from './router.js';
import { openSurahView } from './surah-viewer.js';
import { openReciterSheet } from './reciter-picker.js';

/**
 * ربط أزرار التنقل لشاشات الديسكتوب، تبويبات التصفية، ونافذة الحساب
 */
export function setupDesktopNavAndModals() {
  document.getElementById('nav-home-btn')?.addEventListener('click', () => switchView('home'));
  document.getElementById('nav-browse-btn')?.addEventListener('click', () => switchView('browse'));
  document.getElementById('nav-reciters-btn')?.addEventListener('click', () => switchView('reciters'));
  document.getElementById('nav-bookmarks-btn')?.addEventListener('click', () => switchView('bookmarks'));
  document.getElementById('logo-home-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('home');
  });
  document.getElementById('btn-goto-browse')?.addEventListener('click', () => switchView('browse'));

  // زر استئناف الختمة
  document.getElementById('btn-resume-khatmah')?.addEventListener('click', () => {
    const kahf = state.surahs.find(s => s.id === 18);
    if (kahf) openSurahView(kahf, 45, 0, true);
  });

  // زر مشاركة الآية في المحفوظات
  document.getElementById('btn-share-verse')?.addEventListener('click', () => {
    const text = document.getElementById('khatmah-verse-content')?.textContent.trim();
    if (navigator.clipboard && text) {
      navigator.clipboard.writeText(text);
      showToast('تم نسخ الآية الكريمة بنجاح');
    }
  });

  // تبويبات المحفوظات
  document.querySelectorAll('.bm-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bm-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderBookmarksView(btn.dataset.bmType, document.getElementById('bm-filter-input')?.value || '', (s, a) => openSurahView(s, a, 0, true));
    });
  });

  document.getElementById('bm-filter-input')?.addEventListener('input', (e) => {
    const activeTab = document.querySelector('.bm-tab-btn.active')?.dataset.bmType || 'all';
    renderBookmarksView(activeTab, e.target.value, (s, a) => openSurahView(s, a, 0, true));
  });

  // تصفية السور
  document.querySelectorAll('.filter-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderBrowseSurahGrid(btn.dataset.filter, openReciterSheet);
    });
  });

  // تصفية القرّاء
  document.querySelectorAll('.reciter-filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.reciter-filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderRecitersFullGrid(btn.dataset.narration);
    });
  });

  // اختصار البحث السريع (Ctrl + K / Cmd + K)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      switchView('home');
      const searchInput = document.getElementById('search-input');
      searchInput?.focus();
      searchInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  // نافذة تسجيل الدخول والحساب
  setupAuthModal();
}

/**
 * إدارة النوافذ المنبثقة لتسجيل الدخول وإنشاء الحساب
 */
function setupAuthModal() {
  const authBackdrop = document.getElementById('auth-modal-backdrop');
  document.getElementById('btn-auth-modal')?.addEventListener('click', () => authBackdrop?.classList.add('active'));
  document.getElementById('auth-modal-close')?.addEventListener('click', () => authBackdrop?.classList.remove('active'));
  authBackdrop?.addEventListener('click', (e) => {
    if (e.target.id === 'auth-modal-backdrop') authBackdrop.classList.remove('active');
  });

  const tabLogin = document.getElementById('auth-tab-login');
  const tabSignup = document.getElementById('auth-tab-signup');
  const formLogin = document.getElementById('login-form');
  const formSignup = document.getElementById('signup-form');

  tabLogin?.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabSignup?.classList.remove('active');
    formLogin?.classList.remove('hidden');
    formSignup?.classList.add('hidden');
  });

  tabSignup?.addEventListener('click', () => {
    tabSignup.classList.add('active');
    tabLogin?.classList.remove('active');
    formSignup?.classList.remove('hidden');
    formLogin?.classList.add('hidden');
  });

  formLogin?.addEventListener('submit', (e) => {
    e.preventDefault();
    authBackdrop?.classList.remove('active');
    showToast('تم تسجيل الدخول بنجاح. مرحباً بك في رتل!');
  });

  formSignup?.addEventListener('submit', (e) => {
    e.preventDefault();
    authBackdrop?.classList.remove('active');
    showToast('تم إنشاء الحساب بنجاح. أهلاً بك في رتل!');
  });
}
