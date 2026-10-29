/**
 * دوال التشفير وتوليد الأملاح وتجزئة كلمات المرور
 * src/features/auth/auth.crypto.js
 */

function getCryptoSubtle() {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle;
  }
  return null;
}

export function generateRandomSalt(byteLength = 16) {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    const buffer = new Uint8Array(byteLength);
    globalThis.crypto.getRandomValues(buffer);
    return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function hashPassword(password, salt) {
  const subtle = getCryptoSubtle();
  if (!subtle) {
    // بديل احتياطي فائق البساطة في البيئات التي تفتقر لمكتبة subtle
    let h = 0;
    const str = `${password}:${salt}`;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    return Math.abs(h).toString(16).padStart(16, '0');
  }

  const encoder = new TextEncoder();
  const passwordKey = await subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 10000,
      hash: 'SHA-256'
    },
    passwordKey,
    256
  );

  return Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPassword(password, storedHash, salt) {
  if (!password || !storedHash || !salt) return false;
  const computedHash = await hashPassword(password, salt);
  return computedHash === storedHash;
}
