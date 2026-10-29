#!/usr/bin/env node
/**
 * رتل - Ratil
 * بناء البيانات الثابتة للنص القرآني والسور
 * scripts/build-data.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('⏳ [1/3] التحقق الإلزامي من البصمات المرجعية...');
const verifyRes = spawnSync('node', [path.join(ROOT_DIR, 'scripts/verify-text.mjs')], {
  stdio: 'inherit',
});

if (verifyRes.status !== 0) {
  console.error('🛑 فشل فحص النص القرآني! تم إيقاف عملية بناء البيانات فوراً.');
  process.exit(1);
}

console.log('📦 [2/3] بناء وتجهيز بيانات السور والآيات...');

// قراءة بيانات السور الأساسية
const surahsFile = path.join(ROOT_DIR, 'data/surahs.json');
let surahs = [];
if (fs.existsSync(surahsFile)) {
  surahs = JSON.parse(fs.readFileSync(surahsFile, 'utf8'));
}

// قراءة النص القرآني المعتمد (حفص)
let hafsSource = path.join(ROOT_DIR, 'data/source/quran-hafs.txt');
if (!fs.existsSync(hafsSource)) {
  hafsSource = path.join(ROOT_DIR, 'data/source/quran-uthmani-hafs.txt');
}

const hafsRaw = fs.readFileSync(hafsSource, 'utf8');
const lines = hafsRaw.split(/\r?\n/).filter(line => line.trim().length > 0);

// تجميع الآيات لكل سورة
const surahVersesMap = {};
for (const line of lines) {
  const parts = line.split('|');
  if (parts.length >= 3) {
    const sId = parseInt(parts[0], 10);
    const aNum = parseInt(parts[1], 10);
    const text = parts.slice(2).join('|').trim();
    if (!surahVersesMap[sId]) {
      surahVersesMap[sId] = [];
    }
    surahVersesMap[sId].push({
      number: aNum,
      text: text,
    });
  }
}

// تحديث وتوحيد حقول surahs.json
const updatedSurahs = surahs.map(s => {
  const sId = s.id;
  const verses = surahVersesMap[sId] || [];
  const nameAr = s.name_ar || s.name || s.ar || '';
  const nameEn = s.name_en || s.en || '';
  return {
    id: sId,
    ar: nameAr,
    name_ar: nameAr,
    en: nameEn,
    name_en: nameEn,
    type: s.type || 'مكية',
    ayahs: s.ayahs_hafs || verses.length || s.ayahs || 0,
    ayahs_hafs: s.ayahs_hafs || verses.length,
    ayahs_warsh: s.ayahs_warsh || s.ayahs_hafs || verses.length,
    page: s.page || 1,
  };
});

// حفظ surahs.json المحدث
fs.writeFileSync(surahsFile, JSON.stringify(updatedSurahs, null, 2), 'utf8');

// حفظ نصوص الآيات لكل سورة في مجلد مخصص لسهولة التحميل السريع
const surahTextDir = path.join(ROOT_DIR, 'data/surahs-text');
fs.mkdirSync(surahTextDir, { recursive: true });

for (let sId = 1; sId <= 114; sId++) {
  const verses = surahVersesMap[sId] || [];
  const meta = updatedSurahs.find(s => s.id === sId) || { id: sId, ar: '', en: '' };
  const surahPayload = {
    id: sId,
    ar: meta.ar,
    name_ar: meta.ar,
    en: meta.en,
    name_en: meta.en,
    type: meta.type,
    ayahs_count: verses.length,
    page: meta.page,
    verses: verses,
  };
  fs.writeFileSync(
    path.join(surahTextDir, `${sId}.json`),
    JSON.stringify(surahPayload, null, 2),
    'utf8'
  );
}

// حفظ نسخة مجمعة data/quran-verses.json للاستعلام السريع
fs.writeFileSync(
  path.join(ROOT_DIR, 'data/quran-verses.json'),
  JSON.stringify(surahVersesMap),
  'utf8'
);

// ضمان توفر نسخة في public/data للاستخدام الثابت من المتصفح
const publicDataDir = path.join(ROOT_DIR, 'public/data');
fs.mkdirSync(publicDataDir, { recursive: true });
fs.copyFileSync(surahsFile, path.join(publicDataDir, 'surahs.json'));
fs.copyFileSync(path.join(ROOT_DIR, 'data/quran-verses.json'), path.join(publicDataDir, 'quran-verses.json'));

const publicSurahTextDir = path.join(publicDataDir, 'surahs-text');
fs.mkdirSync(publicSurahTextDir, { recursive: true });
for (let sId = 1; sId <= 114; sId++) {
  fs.copyFileSync(
    path.join(surahTextDir, `${sId}.json`),
    path.join(publicSurahTextDir, `${sId}.json`)
  );
}

console.log(`✅ تم بناء بيانات 114 سورة و ${lines.length} آية بنجاح.`);
console.log('🎉 اكتمل إعداد البيانات الثابتة وتزامنها مع public/data بنجاح.');
process.exit(0);
