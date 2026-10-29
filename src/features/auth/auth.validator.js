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

export function validateSignupData({ name, email, password, confirmPassword }) {
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

  return { valid: true };
}
