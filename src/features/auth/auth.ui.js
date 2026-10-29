/**
 * معالج واجهات وأحداث تسجيل الدخول وإنشاء الحساب
 * src/features/auth/auth.ui.js
 */

import { authService } from './auth.service.js';
import { AUTH_ROLES, AUTH_STORAGE_KEYS } from './auth.constants.js';
import { evaluatePasswordStrength } from './auth.validator.js';

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
        icon.textContent = isPassword ? 'visibility_off' : 'visibility';
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

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-75');
    }

    try {
      const res = await authService.login(
        idInput.value,
        pwdInput.value,
        rememberBox ? rememberBox.checked : true
      );

      if (!res.success) {
        showError(res.error || 'فشل تسجيل الدخول، يرجى التأكد من البيانات');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('opacity-75');
        }
        return;
      }

      const pendingRedirect = sessionStorage.getItem(AUTH_STORAGE_KEYS.LOGIN_REDIRECT);
      if (pendingRedirect) {
        sessionStorage.removeItem(AUTH_STORAGE_KEYS.LOGIN_REDIRECT);
        window.location.href = pendingRedirect;
      } else if (res.session.role === AUTH_ROLES.ADMIN) {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
    } catch {
      showError('حدث خطأ غير متوقع أثناء الاتصال');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-75');
      }
    }
  });
}

export function setupSignupForm({
  formId = 'signup-form',
  nameInputId = 'name',
  emailInputId = 'email',
  pwdInputId = 'password',
  confirmPwdInputId = 'confirmPassword',
  agreeTermsId = 'agreeTerms',
  riwayahBtnClass = 'riwayah-btn',
  strengthMeterId = 'strength-meter',
  strengthTextId = 'strength-text',
  errorBoxId = 'auth-error',
  submitBtnId = 'submit-btn'
} = {}) {
  if (typeof document === 'undefined') return;

  const form = document.getElementById(formId);
  const nameInput = document.getElementById(nameInputId);
  const emailInput = document.getElementById(emailInputId);
  const pwdInput = document.getElementById(pwdInputId);
  const confirmPwdInput = document.getElementById(confirmPwdInputId);
  const agreeTermsBox = document.getElementById(agreeTermsId);
  const errorBox = document.getElementById(errorBoxId);
  const submitBtn = document.getElementById(submitBtnId);
  const strengthMeter = document.getElementById(strengthMeterId);
  const strengthText = document.getElementById(strengthTextId);

  if (!form || !nameInput || !emailInput || !pwdInput) return;

  let selectedRiwaya = 'hafs';
  const riwayahBtns = document.querySelectorAll(`.${riwayahBtnClass}`);
  riwayahBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      riwayahBtns.forEach(b => {
        b.classList.remove('bg-primary/15', 'text-primary', 'shadow-sm', 'font-medium');
        b.classList.add('bg-surface-container-highest/40', 'text-on-surface-variant');
        b.setAttribute('data-active', 'false');
      });
      btn.classList.remove('bg-surface-container-highest/40', 'text-on-surface-variant');
      btn.classList.add('bg-primary/15', 'text-primary', 'shadow-sm', 'font-medium');
      btn.setAttribute('data-active', 'true');
      selectedRiwaya = btn.getAttribute('data-riwaya') || 'hafs';
    });
  });

  // تحديث مؤشر قوة كلمة المرور بصرياً
  if (pwdInput && strengthMeter && strengthText) {
    const bars = strengthMeter.querySelectorAll('.strength-bar-seg');
    pwdInput.addEventListener('input', () => {
      const evaluation = evaluatePasswordStrength(pwdInput.value);
      strengthText.textContent = `قوة كلمة المرور: ${evaluation.label}`;
      bars.forEach((bar, idx) => {
        if (idx < evaluation.score) {
          bar.className = 'strength-bar-seg rounded-full h-full ' + (evaluation.score >= 3 ? 'bg-primary' : 'bg-primary/50');
        } else {
          bar.className = 'strength-bar-seg rounded-full h-full bg-surface-container-highest/60';
        }
      });
    });
  }

  const showError = (msg) => {
    if (errorBox) {
      errorBox.textContent = msg;
      errorBox.classList.remove('hidden');
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

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-75');
    }

    try {
      const res = await authService.signup({
        name: nameInput.value,
        email: emailInput.value,
        password: pwdInput.value,
        confirmPassword: confirmPwdInput ? confirmPwdInput.value : pwdInput.value,
        riwaya: selectedRiwaya,
        agreeTerms: agreeTermsBox ? agreeTermsBox.checked : true
      });

      if (!res.success) {
        showError(res.error || 'فشل إنشاء الحساب، يرجى مراجعة البيانات المدخلة');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('opacity-75');
        }
        return;
      }

      window.location.href = '/';
    } catch {
      showError('حدث خطأ غير متوقع أثناء إنشاء الحساب');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-75');
      }
    }
  });
}
