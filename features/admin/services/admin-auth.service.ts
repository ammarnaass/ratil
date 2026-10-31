/**
 * رتل - Ratil
 * خدمة التحقق من صلاحيات المدير في الخادم (Admin Authorization Server Service)
 * features/admin/services/admin-auth.service.ts
 */

import { NextRequest } from 'next/server';
import { verifySessionToken, AUTH_COOKIE_NAME } from '@/features/auth/server';

/**
 * التحقق مما إذا كان الطلب مصرحاً له بصلاحيات الإدارة (Admin Authorization)
 * يدعم:
 * 1. رمز ADMIN_SECRET المباشر في ترويسة Authorization
 * 2. جلسة مستخدم مسجل يحمل رتبة admin (أو البريد admin@dante.com) عبر Authorization Bearer
 * 3. جلسة مستخدم مسجل يحمل رتبة admin عبر كوكي الجلسة HTTP-only
 */
export function isRequestAdmin(req: NextRequest): boolean {
  const adminSecret = process.env.ADMIN_SECRET;
  const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '').trim();

  // 1. التحقق عبر ADMIN_SECRET المباشر
  if (adminSecret && authHeader && authHeader === adminSecret) {
    return true;
  }

  // 2. التحقق عبر توكن الجلسة في ترويسة Authorization
  if (authHeader) {
    const payload = verifySessionToken(authHeader);
    if (
      payload &&
      (payload.role === 'admin' || payload.email.toLowerCase() === 'admin@dante.com')
    ) {
      return true;
    }
  }

  // 3. التحقق عبر كوكي الجلسة الآمن (ratil_session)
  const sessionCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (sessionCookie) {
    const payload = verifySessionToken(sessionCookie);
    if (
      payload &&
      (payload.role === 'admin' || payload.email.toLowerCase() === 'admin@dante.com')
    ) {
      return true;
    }
  }

  return false;
}

export function getAdminActor(req: NextRequest): { id: string; name: string } {
  const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '').trim();
  const sessionCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const token = authHeader || sessionCookie;
  if (token) {
    const payload = verifySessionToken(token);
    if (payload) {
      return { id: payload.userId, name: payload.name || payload.email };
    }
  }
  return { id: 'admin_secret', name: 'مدير النظام (مفتاح سري)' };
}
