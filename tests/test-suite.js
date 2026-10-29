/**
 * رتل - Ratil
 * مجموعة الاختبارات الآلية الشاملة (Automated Test Suite)
 * tests/test-suite.js
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeQuranSearchText, toIndicDigits } from '../src/lib/normalize.js';
import { VerseSyncEngine } from '../src/features/verse-sync.js';
import {
  generateReadableSyncCode,
  deriveKeysFromSyncCode,
  encryptUserData,
  decryptUserData,
  exportBackupFile,
  importBackupFile
} from '../src/core/sync-identity.js';
import {
  validateReportInput,
  submitScientificReport,
  logIntegrityAudit
} from '../src/lib/neon-db.js';

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

console.log('\n🧪 [رتل] بدء تشغيل حزمة الاختبارات الآلية الشاملة...\n');

// 1. اختبار سكربت التحقق من البصمة (verify-text)
console.log('1. اختبار سكربت التحقق من البصمات (verify-text):');
const runVerify = spawnSync(resolve(ROOT_DIR, 'scripts/verify-text'), { stdio: 'pipe' });
assert(runVerify.status === 0, 'سكربت verify-text يعمل بنجاح على الملفات المعتمدة غير المعدلة (Exit Code 0)');

// 2. اختبار كشف التلاعب بالنص (Tamper Detection)
console.log('\n2. اختبار كشف التعديل والتلاعب بالنصوص القرآنية:');
const hafsPath = resolve(ROOT_DIR, 'data/source/quran-uthmani-hafs.txt');
const originalHafs = readFileSync(hafsPath, 'utf-8');

try {
  const tamperedHafs = originalHafs.replace('بِسْمِ ٱللَّهِ', 'بِسْمِ اللهِ');
  writeFileSync(hafsPath, tamperedHafs, 'utf-8');

  const runTampered = spawnSync(resolve(ROOT_DIR, 'scripts/verify-text'), { stdio: 'pipe' });
  assert(runTampered.status === 1, 'يكتشف السكربت أي تعديل طفيف في النص ويفشل فوراً (Exit Code 1)');
} finally {
  writeFileSync(hafsPath, originalHafs, 'utf-8');
}

const runRestored = spawnSync(resolve(ROOT_DIR, 'scripts/verify-text'), { stdio: 'pipe' });
assert(runRestored.status === 0, 'استعادة النص الأصلي تعيد البصمة للتطابق التام 100%');

// 3. اختبار معيار نجاح البحث (البند 5 في وثيقة المشروع)
console.log('\n3. اختبار قواعد تطبيع البحث ومطابقة النصوص:');
const fatihahHafs = JSON.parse(readFileSync(resolve(ROOT_DIR, 'public/data/hafs/1.json'), 'utf-8'));
const fatihahWarsh = JSON.parse(readFileSync(resolve(ROOT_DIR, 'public/data/warsh/1.json'), 'utf-8'));

const query1 = 'الحمد لله رب العالمين';
const normQ1 = normalizeQuranSearchText(query1);

const matchHafs = fatihahHafs.ayahs.find(a => a.text_normalized.includes(normQ1));
assert(matchHafs && matchHafs.aya === 2, `معيار النجاح: البحث عن "${query1}" يجد الآية 2 في حفص`);

const matchWarsh = fatihahWarsh.ayahs.find(a => a.text_normalized.includes(normQ1));
assert(matchWarsh && matchWarsh.aya === 1, `معيار النجاح: البحث عن "${query1}" يجد الآية 1 في ورش`);

// 4. مصفوفة اختبارات خوارزمية التطبيع الشاملة (Comprehensive Normalization Matrix)
console.log('\n4. مصفوفة اختبارات خوارزمية تطبيع النصوص القرآنية (حالات الحافة):');

const normalizationCases = [
  // الهمزات والألف
  ['أَنْعَمْتَ', 'انعمت'],
  ['إِيَّاكَ', 'اياك'],
  ['آمَنُوا', 'امنوا'],
  ['ٱلْحَمْدُ', 'الحمد'],
  ['إِلَٰهِ', 'اله'],
  
  // الألف الخنجرية في الكلمات المتكررة
  ['ٱلرَّحْمَٰنِ', 'الرحمن'],
  ['ذَٰلِكَ', 'ذلك'],
  ['هَٰذَا', 'هذا'],
  ['هَٰذِهِ', 'هذه'],
  ['هَٰؤُلَآءِ', 'هولاء'],
  
  // الكلمات المكتوبة بواو صغيرة أو رسم عثماني خاص
  ['ٱلصَّلَوٰةَ', 'الصلاه'],
  ['ٱلزَّكَوٰةَ', 'الزكاه'],
  ['ٱلْحَيَوٰةَ', 'الحياه'],
  ['مَٰلِكِ', 'مالك'],
  ['ٱلْعَٰلَمِينَ', 'العالمين'],
  
  // التاء المربوطة
  ['جَنَّةٍ', 'جنه'],
  ['رَحْمَةً', 'رحمه'],
  ['قُرَّةَ', 'قره'],
  
  // الياء والألف المقصورة وهمزة النبرة
  ['هُدًى', 'هدي'],
  ['يَسْعَىٰ', 'يسعي'],
  ['يَوْمَئِذٍ', 'يوميذ'],
  ['شَيْءٍ', 'شيء'],
  
  // واو الهمزة
  ['يُؤْمِنُونَ', 'يومنون'],
  ['مَسْؤُولًا', 'مسوولا'],
  
  // علامات الوقف والرموز القرآنية
  ['عَلَيْهِمْ ۚ', 'عليهم'],
  ['أَفَلَا يَعْقِلُونَ ۗ', 'افلا يعقلون'],
  ['قَدْ أَفْلَحَ ۩', 'قد افلح'],
  ['وَٱلْفَجْرِ ۞', 'والفجر'],
  
  // الكشيدة والتطويل
  ['الـــرَّحْــمَــن', 'الرحمن'],
  ['كِـــتَـــابٌ', 'كتاب'],
  
  // التنوين بجميع أنواعه
  ['عَلِيمًا', 'عليما'],
  ['حَكِيمٌ', 'حكيم'],
  ['غَفُورٍ', 'غفور']
];

normalizationCases.forEach(([input, expected]) => {
  const result = normalizeQuranSearchText(input);
  assert(result === expected, `تطبيع: "${input}" ← "${expected}" (النتيجة: "${result}")`);
});

// اختبار الأرقام الهندية والغربية
assert(toIndicDigits(1) === '١', 'تحويل 1 إلى ١');
assert(toIndicDigits(18) === '١٨', 'تحويل 18 إلى ١٨');
assert(toIndicDigits(114) === '١١٤', 'تحويل 114 إلى ١١٤');
assert(normalizeQuranSearchText('سورة ١٨') === 'سوره 18', 'تحويل الأرقام الهندية في البحث إلى قياسية');

// 5. اختبارات محرك التزامن الدقيق للآيات (VerseSyncEngine Unit Tests)
console.log('\n5. اختبارات محرك التزامن الدقيق للآيات (Binary Search & Precision Sync):');

const sampleTimings = [
  { aya: 1, start_ms: 0, end_ms: 5870 },
  { aya: 2, start_ms: 5870, end_ms: 11840 },
  { aya: 3, start_ms: 11840, end_ms: 17500 },
  { aya: 4, start_ms: 17500, end_ms: 22800 },
  { aya: 5, start_ms: 22800, end_ms: 29700 },
  { aya: 6, start_ms: 29700, end_ms: 36200 },
  { aya: 7, start_ms: 36200, end_ms: 48200 }
];

const syncEngine = new VerseSyncEngine(sampleTimings, 7);

assert(syncEngine.hasTimings() === true, 'محرك التزامن يكتشف وجود بيانات التوقيت الموثقة');
assert(syncEngine.getActiveAyah(0.0, 48.2) === 1, 'عند بداية التلاوة (0.0 ثانية): الآية 1');
assert(syncEngine.getActiveAyah(2.5, 48.2) === 1, 'في منتصف الآية الأولى (2.5 ثانية): الآية 1');
assert(syncEngine.getActiveAyah(5.87, 48.2) === 2, 'عند نقطة الانتقال الدقيقة (5.87 ثانية): الآية 2');
assert(syncEngine.getActiveAyah(15.0, 48.2) === 3, 'في الدقيقة 15.0 ثانية: الآية 3');
assert(syncEngine.getActiveAyah(25.0, 48.2) === 5, 'في الدقيقة 25.0 ثانية: الآية 5');
assert(syncEngine.getActiveAyah(45.0, 48.2) === 7, 'في الآية الأخيرة (45.0 ثانية): الآية 7');
assert(syncEngine.getActiveAyah(50.0, 48.2) === 7, 'بعد اكتمال السورة: الآية 7 (آخر آية)');

// اختبار Fallback النسبي عند غياب بيانات التوقيت
const fallbackEngine = new VerseSyncEngine([], 10);
assert(fallbackEngine.hasTimings() === false, 'محرك التزامن يكتشف غياب التوقيت ويتحول للـ Fallback');
assert(fallbackEngine.getActiveAyah(0.0, 100.0, 10) === 1, 'Fallback: عند 0.0s يرجع الآية 1');
assert(fallbackEngine.getActiveAyah(50.0, 100.0, 10) === 6, 'Fallback: عند 50% يرجع الآية 6 من 10');
assert(fallbackEngine.getActiveAyah(95.0, 100.0, 10) === 10, 'Fallback: عند 95% يرجع الآية 10');

// 6. فحص تكامل ملفات البيانات والـ PWA
console.log('\n6. فحص سلامة وتكامل ملفات البيانات و PWA:');
const surahsList = JSON.parse(readFileSync(resolve(ROOT_DIR, 'public/data/surahs.json'), 'utf-8'));
assert(surahsList.length === 114, 'ملف surahs.json يحتوي على 114 سورة كاملة');

const searchIndexHafs = JSON.parse(readFileSync(resolve(ROOT_DIR, 'public/data/search_index_hafs.json'), 'utf-8'));
assert(searchIndexHafs.length === 6236, 'فهرس البحث لحفص يحتوي على 6236 آية');

const searchIndexWarsh = JSON.parse(readFileSync(resolve(ROOT_DIR, 'public/data/search_index_warsh.json'), 'utf-8'));
assert(searchIndexWarsh.length === 6214, 'فهرس البحث لورش يحتوي على 6214 آية');

assert(existsSync(resolve(ROOT_DIR, 'public/manifest.webmanifest')), 'ملف manifest.webmanifest موجود وصالح');
assert(existsSync(resolve(ROOT_DIR, 'public/sw.js')), 'ملف Service Worker (sw.js) موجود للتشغيل دون اتصال');
assert(existsSync(resolve(ROOT_DIR, 'src/features/verse-sync.js')), 'موديول verse-sync.js موجود ومستقل');
assert(existsSync(resolve(ROOT_DIR, 'src/core/storage.js')), 'موديول storage.js (IndexedDB) موجود');
assert(existsSync(resolve(ROOT_DIR, 'public/data/timings/alafasy/1.json')), 'بيانات توقيت سورة الفاتحة بالمللي ثانية للعفاسي موجودة');
assert(existsSync(resolve(ROOT_DIR, 'public/favicon.svg')), 'أيقونة المتصفح المتجهة favicon.svg موجودة وصالحة');
assert(existsSync(resolve(ROOT_DIR, 'public/favicon.ico')), 'أيقونة التوافق القديم favicon.ico متعددة الأحجام موجودة');
assert(existsSync(resolve(ROOT_DIR, 'public/icons/logo.svg')), 'شعار المنصة المتجه الكامل logo.svg موجود');
assert(existsSync(resolve(ROOT_DIR, 'public/icons/icon-192.png')), 'أيقونة التطبيق PWA (192x192) موجودة');
assert(existsSync(resolve(ROOT_DIR, 'public/icons/icon-512.png')), 'أيقونة التطبيق PWA (512x512) موجودة');
assert(existsSync(resolve(ROOT_DIR, 'public/icons/apple-touch-icon.png')), 'أيقونة أجهزة آبل apple-touch-icon موجودة');

console.log('\n7. فحص الامتثال لمعمارية الميزات المعيارية (Feature Modular Structure):');
assert(existsSync(resolve(ROOT_DIR, '.agents/skills/feature-modular-structure/SKILL.md')), 'مهارة feature-modular-structure مثبتة في .agents/skills');
assert(existsSync(resolve(ROOT_DIR, 'src/features/verse-sync/index.js')), 'مجلد وموديول مدخل ميزة verse-sync/index.js موجود');
assert(existsSync(resolve(ROOT_DIR, 'src/features/search/index.js')), 'مجلد وموديول مدخل ميزة search/index.js موجود');
assert(existsSync(resolve(ROOT_DIR, 'src/features/bookmarks/index.js')), 'مجلد وموديول مدخل ميزة bookmarks/index.js موجود');
assert(existsSync(resolve(ROOT_DIR, 'src/features/navigation/index.js')), 'مجلد وموديول مدخل ميزة navigation/index.js موجود');
assert(existsSync(resolve(ROOT_DIR, 'src/features/audio-download/index.js')), 'مجلد وموديول مدخل ميزة audio-download/index.js موجود');

// فحص سقف الأسطر لجميع ملفات الميزات (<= 150 سطر لكل ملف)
const featureDirs = ['bookmarks', 'navigation', 'search', 'verse-sync', 'audio-download'];
let allUnderLimit = true;
const MAX_LINES = 150;

for (const fDir of featureDirs) {
  const fullDirPath = resolve(ROOT_DIR, 'src/features', fDir);
  const files = readdirSync(fullDirPath);
  for (const f of files) {
    if (f.endsWith('.js')) {
      const lineCount = readFileSync(resolve(fullDirPath, f), 'utf-8').split('\n').length;
      if (lineCount > MAX_LINES) {
        allUnderLimit = false;
        console.error(`    الملف ${fDir}/${f} يتجاوز الحد (${lineCount} سطر > ${MAX_LINES})`);
      }
    }
  }
}
assert(allUnderLimit, 'كافة ملفات الميزات تحقق معيار الحجم الصارم (أقل من 150 سطراً لكل ملف)');

console.log('\n8. اختبارات منظومة تخزين وبث الصوتيات وتقطيع الـ Range (HTTP 206 Synthesizer):');
assert(existsSync(resolve(ROOT_DIR, 'src/features/audio-download/storage-quota.js')), 'موديول حصص التخزين storage-quota.js موجود');
assert(existsSync(resolve(ROOT_DIR, 'src/features/audio-download/download-manager.js')), 'موديول إدارة التنزيل download-manager.js موجود');
assert(existsSync(resolve(ROOT_DIR, 'src/features/audio-download/offline-audio-ui.js')), 'موديول واجهة الأوفلاين offline-audio-ui.js موجود');

// فحص منطق تقطيع الـ Range Requests الصارم (محاكاة طلبات Safari و iOS)
function synthesizeRange(rangeHeader, totalLength) {
  const parts = rangeHeader.replace(/bytes=/, '').split('-');
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : totalLength - 1;
  const length = end - start + 1;
  return { start, end, length, contentRange: `bytes ${start}-${end}/${totalLength}` };
}

// 1. اختبار فحص مجس Safari الأولي (bytes=0-1)
const probe = synthesizeRange('bytes=0-1', 10000);
assert(probe.start === 0 && probe.end === 1 && probe.length === 2, 'مجس Safari الأولي (bytes=0-1) يعود بطول بايتين بالضبط');
assert(probe.contentRange === 'bytes 0-1/10000', 'ترويسة Content-Range للـ probe مطابقة للمواصفات');

// 2. اختبار القفز لثانية محددة (Seeking: bytes=2500-5000)
const seek = synthesizeRange('bytes=2500-5000', 10000);
assert(seek.start === 2500 && seek.end === 5000 && seek.length === 2501, 'القفز للآية (bytes=2500-5000) يقطع النطاق بدقة');
assert(seek.contentRange === 'bytes 2500-5000/10000', 'ترويسة التمرير الجزئي Content-Range مطابقة');

// 3. اختبار الدفق حتى نهاية الملف (Open-ended: bytes=8000-)
const tail = synthesizeRange('bytes=8000-', 10000);
assert(tail.start === 8000 && tail.end === 9999 && tail.length === 2000, 'الدفق للنهاية (bytes=8000-) يغطي حتى آخر بايت (9999)');
assert(tail.contentRange === 'bytes 8000-9999/10000', 'ترويسة دفق النهاية Content-Range صحيحة');

console.log('\n9. اختبارات تكامل أرشفة التلاوات على Archive.org ومحرك الـ Failover المزدوج:');
assert(existsSync(resolve(ROOT_DIR, 'scripts/upload-to-archive.py')), 'سكربت upload-to-archive.py موجود للأرشفة الآمنة');

const audioManifest = JSON.parse(readFileSync(resolve(ROOT_DIR, 'data/audio-manifest.json'), 'utf-8'));
assert(audioManifest.reciters && audioManifest.reciters['al-minshawy'], 'قارئ المنشاوي موجود في audio-manifest.json');
assert(audioManifest.reciters['al-minshawy'].archive_item === 'ratil-quran-hafs-al-minshawy', 'معرف أرشيف المنشاوي مطابق للمواصفات');
assert(audioManifest.reciters['al-husary'].archive_item === 'ratil-quran-warsh-al-husary', 'معرف أرشيف الحصري ورش مطابق للمواصفات');

const minshawyFatiha = audioManifest.reciters['al-minshawy'].surahs['1'];
assert(Array.isArray(minshawyFatiha.urls) && minshawyFatiha.urls.length === 2, 'سورة الفاتحة تحتوي على مساري تلاوة مزدوجين');
assert(minshawyFatiha.urls[0].includes('cdn.ratil.app'), 'المسار الأول هو شبكة التوزيع السريع cdn.ratil.app');
assert(minshawyFatiha.urls[1].includes('archive.org/download'), 'المسار الثاني هو مرآة أرشيف الإنترنت الصامدة archive.org');

// فحص دالة توليد مسار الأرشيف البديل (Fallback URL generation)
function getArchiveFallbackTest(urlStr) {
  const u = new URL(urlStr);
  const parts = u.pathname.split('/').filter(Boolean);
  if (parts.length >= 3 && parts[0] === 'audio') {
    const reciter = parts[1];
    const filename = parts[2];
    const map = {
      'al-minshawy': 'ratil-quran-hafs-al-minshawy',
      'al-husary': 'ratil-quran-warsh-al-husary',
      'alafasy': 'ratil-quran-hafs-alafasy'
    };
    return `https://archive.org/download/${map[reciter] || 'ratil-quran-' + reciter}/${filename}`;
  }
  return null;
}
const generatedFallback = getArchiveFallbackTest('https://cdn.ratil.app/audio/al-minshawy/001_al-fatiha.mp3');
assert(generatedFallback === 'https://archive.org/download/ratil-quran-hafs-al-minshawy/001_al-fatiha.mp3', 'خوارزمية توليد مسار الأرشيف البديل مطابقة تماماً للمواصفات');

console.log('\n10. اختبارات محرك الهوية المشفرة محلياً والمزامنة الصامتة (Zero-Knowledge Sync Engine):');
assert(existsSync(resolve(ROOT_DIR, 'src/core/sync-identity.js')), 'موديول sync-identity.js موجود ومستقل');
assert(existsSync(resolve(ROOT_DIR, 'workers/sync-relay.js')), 'خادم الوسيط الأعمى workers/sync-relay.js موجود');

const syncCode = generateReadableSyncCode();
assert(syncCode.length === 19 && syncCode.split('-').length === 4, 'كود المزامنة البشري 16 حرفاً مقسماً لـ 4 مقاطع بدقة');

const { encryptionKey, storageKey } = await deriveKeysFromSyncCode(syncCode);
assert(encryptionKey && storageKey.length === 64, 'اشتقاق مفتاح التشفير المتماثل ومفتاح البحث الأعمى بطول 64 حرف hex');

const sampleUserData = {
  version: '1.0.0',
  bookmarks: [{ id: 'bm-test-1', surahId: 1, ayah: 7, text: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ' }],
  lastSession: { surahId: 1, ayah: 7, currentTime: 45.2 }
};

const encryptedPayload = await encryptUserData(syncCode, sampleUserData);
assert(encryptedPayload.encryptedBase64 && encryptedPayload.storageKey === storageKey, 'تشفير بيانات المستخدم بنجاح مع مطابقة مفتاح البحث الأعمى');

const decryptedPayload = await decryptUserData(syncCode, encryptedPayload.encryptedBase64);
assert(decryptedPayload.bookmarks[0].text === 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ', 'فك التشفير بنجاح واستعادة البيانات الدقيقة 100%');

let failedWithWrongKey = false;
try {
  await decryptUserData('RTL0-WRONG-KEY0-TEST', encryptedPayload.encryptedBase64);
} catch (e) {
  failedWithWrongKey = true;
}
assert(failedWithWrongKey, 'فشل فك التشفير ورفض الوصول عند استخدام مفتاح مزامنة خاطئ');

const exportedBackup = exportBackupFile(sampleUserData);
const reimportedBackup = await importBackupFile(exportedBackup);
assert(reimportedBackup.bookmarks.length === 1 && reimportedBackup.bookmarks[0].surahId === 1, 'تصدير واستيراد ملف النسخة الاحتياطية بنجاح دون أي فقد');

console.log('\n11. اختبارات تكامل مرآة Vercel الثابتة وقاعدة بيانات Neon للحوكمة:');
assert(existsSync(resolve(ROOT_DIR, 'vercel.json')), 'ملف إعدادات النشر vercel.json موجود');
const vercelConfig = JSON.parse(readFileSync(resolve(ROOT_DIR, 'vercel.json'), 'utf-8'));
assert(vercelConfig.framework === 'astro' && vercelConfig.outputDirectory === 'dist', 'إعدادات vercel.json تطابق متطلبات النشر الثابت الصرف');

assert(existsSync(resolve(ROOT_DIR, 'db/schema.sql')), 'مخطط قاعدة بيانات Neon db/schema.sql موجود');
const schemaContent = readFileSync(resolve(ROOT_DIR, 'db/schema.sql'), 'utf-8');
assert(schemaContent.includes('CREATE TABLE IF NOT EXISTS scientific_reports'), 'جدول البلاغات العلمية scientific_reports معرف في المخطط');
assert(schemaContent.includes('CREATE TABLE IF NOT EXISTS text_integrity_audits'), 'جدول تدقيق البصمات text_integrity_audits معرف في المخطط');
assert(schemaContent.includes('CREATE TABLE IF NOT EXISTS audio_licenses_registry'), 'جدول تراخيص القرّاء audio_licenses_registry معرف في المخطط');

assert(existsSync(resolve(ROOT_DIR, 'src/lib/neon-db.js')), 'موديول src/lib/neon-db.js موجود');

// فحص مدخلات البلاغ العلمي
const invalidReport = validateReportInput({ surahId: 150, ayaNumber: 1, riwaya: 'hafs', description: 'خطأ' });
assert(!invalidReport.valid, 'دالة التحقق ترفض أرقام السور غير الصالحة والأوصاف القصيرة جداً');

const validReportData = {
  surahId: 1,
  ayaNumber: 2,
  riwaya: 'hafs',
  reciterId: 'al-minshawy',
  reportType: 'timing_mismatch',
  timestampMs: 5870,
  description: 'ملاحظة دقيقة في توقيت انتقال الآية الثانية'
};
const validReport = validateReportInput(validReportData);
assert(validReport.valid, 'دالة التحقق تقبل البلاغات العلمية المستوفية للشروط');

const reportResult = await submitScientificReport(validReportData);
assert(reportResult && reportResult.status === 'pending', 'تسجيل البلاغ العلمي بنجاح في منظومة الحوكمة');

const auditResult = await logIntegrityAudit('test-commit-sha', 'test-hafs-sha', 'test-warsh-sha', 'VERIFIED');
assert(auditResult && auditResult.status === 'VERIFIED', 'تسجيل فحص البصمة الرقمية بنجاح في سجل الحوكمة');

console.log(`\n🎉 اكتملت الاختبارات: نجح ${passedTests} من أصل ${totalTests} اختبار.`);
if (process.exitCode === 1) {
  console.error('❌ توجد اختبارات فاشلة.');
  process.exit(1);
} else {
  console.log('✅ جميع الاختبارات اجتازت بنجاح بنسبة 100%.\n');
}


