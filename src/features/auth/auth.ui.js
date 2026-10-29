/**
 * معالج واجهات وأحداث تسجيل الدخول وإنشاء الحساب
 * src/features/auth/auth.ui.js
 */

import { authService } from './auth.service.js';
import { AUTH_ROLES, AUTH_STORAGE_KEYS } from './auth.constants.js';

export function setupPasswordToggle(btnId = 'togglePassword', inputId = 'password', iconId = 'passwordIcon') {
  if (typeof document === 'undefined') return;

  const toggleBtn = document.getElementById(btnId);
  const pwdInput = document.getElementById(inputId);
  const icon = document.getElementById(iconId);

  if (toggleBtn && pwdInput) {
    toggleBtn.addEventListener('click', () => {
      const isPassword = pwdInput.type === 'password';
      pwdInput.type = isPassword ? 'text' : 'password';
      if (icon) {
        icon.textContent = isPassword ? 'visibility' : 'visibility_off';
      }
    });
  }
}

export function setupLoginForm({
  formId = 'login-form',
  idInputId = 'identifier',
  pwdInputId = 'password',
  rememberId = 'remember',
  errorBoxId = 'auth-error',
  submitBtnId = 'submit-btn'
} = {}) {
  if (typeof document === 'undefined') return;

  const form = document.getElementById(formId);
  const idInput = document.getElementById(idInputId);
  const pwdInput = document.getElementById(pwdInputId);
  const rememberBox = document.getElementById(rememberId);
  const errorBox = document.getElementById(errorBoxId);
  const submitBtn = document.getElementById(submitBtnId);

  if (!form || !idInput || !pwdInput) return;

  const showError = (msg) => {
    if (errorBox) {
      errorBox.textContent = msg;
      errorBox.classList.remove('hidden');
    } else {
      alert(msg);
    }
  };

  const clearError = () => {
    if (errorBox) {
      errorBox.textContent = '';
      errorBox.classList.add('hidden');
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const identifier = idInput.value;
    const password = pwdInput.value;
    const remember = rememberBox ? rememberBox.checked : true;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-75');
    }

    try {
      const res = await authService.login(identifier, password, remember);
      if (!res.success) {
        showError(res.error || 'فشل تسجيل الدخول، يرجى التأكد من البيانات');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('opacity-75');
        }
        return;
      }

      // توجيه تلقائي: المدير يذهب للوحة التحكم /admin والمستخدم للمصحف /
      const pendingRedirect = sessionStorage.getItem(AUTH_STORAGE_KEYS.LOGIN_REDIRECT);
      if (pendingRedirect) {
        sessionStorage.removeItem(AUTH_STORAGE_KEYS.LOGIN_REDIRECT);
        window.location.href = pendingRedirect;
      } else if (res.session.role === AUTH_ROLES.ADMIN) {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      showError('حدث خطأ غير متوقع أثناء الاتصال');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-75');
      }
    }
  });
}
