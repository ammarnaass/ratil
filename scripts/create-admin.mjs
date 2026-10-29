/**
 * رتل - Ratil
 * إنشاء حساب مدير النظام في قاعدة بيانات Neon
 * scripts/create-admin.mjs
 */

import crypto from 'node:crypto';
import { neon } from '@neondatabase/serverless';

const ITERATIONS = 100000;
const KEY_LEN = 64;
const DIGEST = 'sha512';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LEN, DIGEST, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

async function createAdmin() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ خطأ: متغير DATABASE_URL غير محدد.');
    process.exit(1);
  }

  // المعاملات من سطر الأوامر أو الافتراضية
  const args = process.argv.slice(2);
  const email = (args[0] || 'admin@ratil.app').toLowerCase().trim();
  const name = args[1] || 'مدير رتل';
  const password = args[2] || 'RatilAdmin@2026!';

  console.log(`🚀 جاري إنشاء/ترقية حساب مدير النظام:`);
  console.log(`   • البريد الإلكتروني: ${email}`);
  console.log(`   • الاسم: ${name}`);

  const sql = neon(databaseUrl);

  const passwordHash = await hashPassword(password);

  const existing = await sql`
    SELECT id, email, role FROM users WHERE email = ${email} LIMIT 1;
  `;

  if (existing.length > 0) {
    await sql`
      UPDATE users 
      SET name = ${name}, password_hash = ${passwordHash}, role = 'admin', updated_at = NOW()
      WHERE email = ${email};
    `;
    console.log(`✅ تم تحديث وترقية الحساب الحالي إلى رتبة مدير (admin) بنجاح.`);
  } else {
    await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name}, ${email}, ${passwordHash}, 'admin');
    `;
    console.log(`🎉 تم إنشاء حساب المدير الجديد بنجاح.`);
  }

  console.log('\n──────────────────────────────────────────────');
  console.log('بيانات تسجيل الدخول:');
  console.log(`  البريد الإلكتروني: ${email}`);
  console.log(`  كلمة المرور:       ${password}`);
  console.log(`  الرتبة:            admin`);
  console.log('──────────────────────────────────────────────\n');
}

createAdmin().catch((err) => {
  console.error('❌ فشل إنشاء حساب المدير:', err);
  process.exit(1);
});
