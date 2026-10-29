/**
 * رتل - Ratil
 * الاتصال بقاعدة بيانات Neon PostgreSQL
 * lib/db.ts
 */

import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

// Neon serverless driver — يعمل في بيئة Vercel Edge و Node.js
export const sql = databaseUrl
  ? neon(databaseUrl)
  : ((query: any, ...values: any[]) => {
      console.warn('⚠️ DATABASE_URL غير محدد. يتم تشغيل الاستعلام في الوضع المحلي/الثابت الاحتياطي.');
      return Promise.resolve([]);
    }) as any;

export default sql;
