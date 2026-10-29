/**
 * مدقق بيانات تسجيل الدخول وإنشاء الحساب
 * src/features/auth/auth.validator.js
 */

export function validateIdentifier(identifier) {
  if (!identifier || typeof identifier !== 'string') {
    return { valid: false, error: 'يرجى إدخال البريد الإلكتروني أو اسم المستخدم' };
  }
  const trimmed = identifier.trim();
  if (trimmed.length < 3) {
    return { valid: false, error: 'اسم المستخدم أو البريد يجب ألا يقل عن 3 أحرف' };
  }
  return { valid: true, value: trimmed };
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'يرجى إدخال كلمة المرور' };
  }
  if (password.length < 6) {
    return { valid: false, error: 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل' };
  }
  return { valid: true };
}

export function evaluatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { score: 0, label: 'فارغة', color: 'text-outline', width: '0%' };
  }
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

  const labels = [
    { label: 'قصيرة جداً', color: 'text-error', width: '25%' },
    { label: 'ضعيفة', color: 'text-error', width: '25%' },
    { label: 'مقبولة', color: 'text-outline', width: '50%' },
    { label: 'جيدة ومطمئنة', color: 'text-secondary', width: '75%' },
    { label: 'قوية ومناسبة', color: 'text-primary', width: '100%' }
  ];

  return {
    score,
    ...labels[score]
  };
}

export function validateSignupData({ name, email, password, confirmPassword, agreeTerms = true }) {
  if (!name || name.trim().length < 2) {
    return { valid: false, error: 'الاسم الكامل مطلوب (حرفان على الأقل)' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return { valid: false, error: 'يرجى إدخال بريد إلكتروني صالح' };
  }

  const pwdCheck = validatePassword(password);
  if (!pwdCheck.valid) {
    return pwdCheck;
  }

  if (password !== confirmPassword) {
    return { valid: false, error: 'كلمتا المرور غير متطابقتين' };
  }

  if (!agreeTerms) {
    return { valid: false, error: 'يرجى الموافقة على شروط الاستخدام وسياسة الخصوصية' };
  }

  return { valid: true };
}
