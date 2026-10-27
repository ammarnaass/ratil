/**
 * رتل - Ratil
 * مجموعة الاختبارات الآلية الشاملة
 * tests/test-suite.js
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeQuranSearchText, toIndicDigits } from '../scripts/normalize-text.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${testName}`);
  } else {
    console.error(`  ✗ فشل الاختبار: ${testName}`);
    process.exitCode = 1;
  }
}

console.log('\n🧪 [رتل] بدء تشغيل حزمة الاختبارات الآلية...\n');

// 1. اختبار سكربت التحقق من البصمة (verify-text)
console.log('1. اختبار سكربت التحقق من البصمات (verify-text):');

const runVerify = spawnSync(resolve(ROOT_DIR, 'scripts/verify-text'), { stdio: 'pipe' });
assert(runVerify.status === 0, 'سكربت verify-text يعمل بنجاح على الملفات المعتمدة غير المعدلة (Exit Code 0)');

// 2. اختبار كشف التلاعب بالنص (Tamper Detection)
console.log('\n2. اختبار كشف التعديل والتلاعب بالنصوص القرآنية:');
const hafsPath = resolve(ROOT_DIR, 'data/source/quran-uthmani-hafs.txt');
const originalHafs = readFileSync(hafsPath, 'utf-8');

try {
  // محاكاة تعديل طفيف جداً بحرف واحد
  const tamperedHafs = originalHafs.replace('بِسْمِ ٱللَّهِ', 'بِسْمِ اللهِ');
  writeFileSync(hafsPath, tamperedHafs, 'utf-8');

  const runTampered = spawnSync(resolve(ROOT_DIR, 'scripts/verify-text'), { stdio: 'pipe' });
  assert(runTampered.status === 1, 'يكتشف السكربت أي تعديل طفيف في النص ويفشل فوراً (Exit Code 1)');
} finally {
  // إعادة الملف الأصلي المعتمد فوراً
  writeFileSync(hafsPath, originalHafs, 'utf-8');
}

// التأكد من استعادة البصمة الصحيحة
const runRestored = spawnSync(resolve(ROOT_DIR, 'scripts/verify-text'), { stdio: 'pipe' });
assert(runRestored.status === 0, 'استعادة النص الأصلي تعيد البصمة للتطابق التام 100%');

// 3. اختبار معيار نجاح البحث (البند 5 في وثيقة المشروع)
console.log('\n3. اختبار قواعد تطبيع البحث ومطابقة النصوص:');

const fatihahHafs = JSON.parse(readFileSync(resolve(ROOT_DIR, 'public/data/hafs/1.json'), 'utf-8'));
const fatihahWarsh = JSON.parse(readFileSync(resolve(ROOT_DIR, 'public/data/warsh/1.json'), 'utf-8'));

// معيار النجاح المنصوص عليه صراحة في الوثيقة:
// "معيار النجاح: البحث عن «الحمد لله رب العالمين» بلا تشكيل يجد سورة الفاتحة"
const query1 = 'الحمد لله رب العالمين';
const normQ1 = normalizeQuranSearchText(query1);

const matchHafs = fatihahHafs.ayahs.find(a => a.text_normalized.includes(normQ1));
assert(matchHafs && matchHafs.aya === 2, `معيار النجاح: البحث عن "${query1}" يجد الآية 2 في حفص`);

const matchWarsh = fatihahWarsh.ayahs.find(a => a.text_normalized.includes(normQ1));
assert(matchWarsh && matchWarsh.aya === 1, `معيار النجاح: البحث عن "${query1}" يجد الآية 1 في ورش`);

// 4. اختبارات حالات التطبيع الخاصة
console.log('\n4. اختبارات توحيد الحروف والإملاء:');
assert(normalizeQuranSearchText('إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ') === 'انا اعطيناك الكوثر', 'توحيد الهمزات والألف الخنجرية والياء في الكوثر');
assert(normalizeQuranSearchText('قُلْ هُوَ ٱللَّهُ أَحَدٌ') === 'قل هو الله احد', 'حذف التشكيل والهمزات في سورة الإخلاص');
assert(normalizeQuranSearchText('وَٱلصَّلَوٰةِ') === 'والصلاه' || normalizeQuranSearchText('ٱلصَّلَوٰةَ') === 'الصلاه', 'توحيد التاء المربوطة');
assert(toIndicDigits(123) === '١٢٣', 'تحويل الأرقام الغربية إلى هندية (123 -> ١٢٣)');

// 5. فحص تكامل ملفات البيانات
console.log('\n5. فحص تكامل البيانات المولدة:');
const surahsList = JSON.parse(readFileSync(resolve(ROOT_DIR, 'public/data/surahs.json'), 'utf-8'));
assert(surahsList.length === 114, 'ملف surahs.json يحتوي على 114 سورة كاملة');

const searchIndexHafs = JSON.parse(readFileSync(resolve(ROOT_DIR, 'public/data/search_index_hafs.json'), 'utf-8'));
assert(searchIndexHafs.length === 6236, 'فهرس البحث لحفص يحتوي على 6236 آية');

const searchIndexWarsh = JSON.parse(readFileSync(resolve(ROOT_DIR, 'public/data/search_index_warsh.json'), 'utf-8'));
assert(searchIndexWarsh.length === 6214, 'فهرس البحث لورش يحتوي على 6214 آية');

console.log(`\n🎉 اكتملت الاختبارات: نجح ${passedTests} من أصل ${totalTests} اختبار.`);
if (process.exitCode === 1) {
  console.error('❌ توجد اختبارات فاشلة.');
  process.exit(1);
} else {
  console.log('✅ جميع الاختبارات اجتازت بنجاح.\n');
}
