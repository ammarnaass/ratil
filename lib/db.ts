/**
 * رتل - Ratil
 * الاتصال بقاعدة بيانات Neon PostgreSQL
 * lib/db.ts
 */

import { neon } from '@neondatabase/serverless';

// ضمان توجيه اتصالات DNS إلى IPv4 أولاً في بيئة Node لتجنب مشاكل مهلة وسقوط اتصالات IPv6
if (typeof process !== 'undefined' && process.versions?.node) {
  try {
    const dns = require('node:dns');
    dns.setDefaultResultOrder?.('ipv4first');
  } catch {}
}

const databaseUrl = process.env.DATABASE_URL;

// Neon serverless driver — يعمل في بيئة Vercel Edge و Node.js
export const sql = databaseUrl
  ? neon(databaseUrl)
  : ((query: any, ...values: any[]) => {
      console.warn('⚠️ DATABASE_URL غير محدد. يتم تشغيل الاستعلام في الوضع المحلي/الثابت الاحتياطي.');
      return Promise.resolve([]);
    }) as any;

export default sql;
