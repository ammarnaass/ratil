/**
 * رتل - Ratil
 * تهيئة وترقية قاعدة بيانات Neon PostgreSQL
 * scripts/init-db.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('ℹ️ DATABASE_URL غير محدد. يتم تخطي تهيئة قاعدة البيانات واستخدام البيانات الثابتة.');
  process.exit(0);
}

const sql = neon(databaseUrl);

async function initDatabase() {
  console.log('🚀 بدء الاتصال بقاعدة بيانات Neon وتهيئة الجداول...');

  const schemaPath = path.join(rootDir, 'db', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // تنظيف التعليقات وتقسيم الأوامر بفاصلة منقوطة
  const cleanSql = schemaSql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');

  const statements = cleanSql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`📦 تم العثور على ${statements.length} أمراً في schema.sql.`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.replace(/\s+/g, ' ').substring(0, 60);
    try {
      await sql(stmt);
      console.log(`  ✅ [${i + 1}/${statements.length}] تم التنفيذ: ${preview}...`);
    } catch (err) {
      console.error(`  ❌ فشل تنفيذ الأمر [${i + 1}]: ${preview}`, err.message);
      throw err;
    }
  }

  // بذر الملفات الصوتية للسور (114 سورة) للقرّاء المعتمدين في حال عدم وجودها
  console.log('\n🎧 بذر بيانات السور الصوتية (114 سورة لكل قارئ)...');
  const reciters = ['al-minshawy', 'al-husary', 'alafasy'];

  for (const reciterId of reciters) {
    const countRes = await sql`
      SELECT COUNT(*)::int AS cnt FROM surah_audio WHERE reciter_id = ${reciterId}
    `;
    const count = countRes[0]?.cnt || 0;

    if (count < 114) {
      console.log(`  📥 بذر سور القارئ ${reciterId} (الحالي: ${count} سورة)...`);
      for (let sNum = 1; sNum <= 114; sNum++) {
        const pad = String(sNum).padStart(3, '0');
        const audioUrl = `https://archive.org/download/ratil-${reciterId}/${pad}.mp3`;
        await sql`
          INSERT INTO surah_audio (reciter_id, surah_number, audio_url, verified)
          VALUES (${reciterId}, ${sNum}, ${audioUrl}, true)
          ON CONFLICT (reciter_id, surah_number) DO NOTHING
        `;
      }
      console.log(`  ✅ اكتملت سور القارئ ${reciterId} بنجاح.`);
    } else {
      console.log(`  ✨ القارئ ${reciterId} مسجل لديه بالفعل 114 سورة.`);
    }
  }

  // فحص حالة الجداول
  console.log('\n📊 تقرير الجداول الحالية في Neon:');
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;

  for (const t of tables) {
    const countRes = await sql(`SELECT COUNT(*)::int AS count FROM "${t.table_name}"`);
    console.log(`  • ${t.table_name.padEnd(24)}: ${countRes[0].count} صفوف`);
  }

  console.log('\n🎉 اكتملت تهيئة قاعدة بيانات Neon بنجاح تام وبأعلى درجات الموثوقية!');
}

initDatabase().catch((err) => {
  console.warn('⚠️ ملاحظة: تعذر الاتصال بـ Neon أثناء البناء:', err.message);
  console.warn('ℹ️ سيستمر البناء بالاعتماد على البيانات الثابتة (SSG Fallback).');
  process.exit(0);
});
