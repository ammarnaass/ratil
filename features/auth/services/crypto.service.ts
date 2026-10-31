/**
 * رتل - Ratil
 * خدمات التشفير الآمن والتوثيق (Server-side Cryptography)
 * features/auth/services/crypto.service.ts
 */

import crypto from 'crypto';

const AUTH_SECRET = process.env.ADMIN_SECRET || 'ratil-auth-secret-key-fallback-seed';
const KEY_LEN = 64;
const TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role?: 'admin' | 'user';
  avatar?: string | null;
  exp?: number;
  iat?: number;
}

/**
 * تشفير كلمة المرور باستخدام خوارزمية scrypt المشددة مع Salt عشوائي
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, KEY_LEN);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * التحقق من كلمة المرور ضد الهاش المخزن بمقارنة مقاومة لهجمات التوقيت
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const parts = storedHash.split(':');
    if (parts.length !== 2) return false;

    const [salt, keyHex] = parts;
    const keyBuffer = Buffer.from(keyHex, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, KEY_LEN);

    if (keyBuffer.length !== derivedKey.length) return false;
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * إنشاء توكن جلسة موقّع ومحمي بـ HMAC-SHA256
 */
export function createSessionToken(payload: Omit<TokenPayload, 'exp' | 'iat'>): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

/**
 * التحقق من صحة توكن الجلسة واستخراج بيانات المستخدم
 */
export function verifySessionToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    const sigA = Buffer.from(signature);
    const sigB = Buffer.from(expectedSignature);
    if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
