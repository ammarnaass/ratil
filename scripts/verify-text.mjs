#!/usr/bin/env node
/**
 * رتل - Ratil
 * فحص سلامة النص القرآني المعتمد والبصمات الرقمية
 * scripts/verify-text.mjs
 * 
 * المبدأ الحاكم: لا يُكتب ولا يُعدل النص يدوياً؛
 * يُتحقق من البصمات (SHA-256) آلياً قبل كل بناء.
 * أي اختلاف، ولو في حركة أو رمز، يُوقف البناء فوراً (Exit Code 1).
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const CHECKSUMS_FILE = path.join(ROOT_DIR, 'data/checksums.json');

if (!fs.existsSync(CHECKSUMS_FILE)) {
  console.error(`❌ ملف البصمات المرجعية مفقود: ${CHECKSUMS_FILE}`);
  process.exit(1);
}

const checksumsData = JSON.parse(fs.readFileSync(CHECKSUMS_FILE, 'utf8'));

function computeSha256(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

let hasError = false;

// 1. فحص نص حفص
let hafsSource = path.join(ROOT_DIR, 'data/source/quran-hafs.txt');
if (!fs.existsSync(hafsSource)) {
  hafsSource = path.join(ROOT_DIR, 'data/source/quran-uthmani-hafs.txt');
}

if (!fs.existsSync(hafsSource)) {
  console.error(`❌ ملف نص حفص المصدر غير موجود: ${hafsSource}`);
  hasError = true;
} else {
  const actualHafs = computeSha256(hafsSource);
  const expectedHafs = checksumsData.hafs || checksumsData.sources?.hafs?.sha256;
  if (actualHafs !== expectedHafs) {
    console.error(`❌ CHECKSUM MISMATCH (Hafs)`);
    console.error(`   Expected: ${expectedHafs}`);
    console.error(`   Actual:   ${actualHafs}`);
    hasError = true;
  } else {
    console.log(`✅ تم التحقق من نص حفص المعتمد (Tanzil v1.1): ${actualHafs}`);
  }
}

// 2. فحص نص ورش
const warshSource = path.join(ROOT_DIR, 'data/source/quran-uthmani-warsh.json');
if (fs.existsSync(warshSource)) {
  const actualWarsh = computeSha256(warshSource);
  const expectedWarsh = checksumsData.warsh || checksumsData.sources?.warsh?.sha256;
  if (expectedWarsh && actualWarsh !== expectedWarsh) {
    console.error(`❌ CHECKSUM MISMATCH (Warsh)`);
    console.error(`   Expected: ${expectedWarsh}`);
    console.error(`   Actual:   ${actualWarsh}`);
    hasError = true;
  } else if (expectedWarsh) {
    console.log(`✅ تم التحقق من نص ورش المعتمد (KFGQPC v10): ${actualWarsh}`);
  }
}

// 3. فحص خطوط المصحف العثماني إن وجدت في البصمات
if (checksumsData.fonts) {
  for (const [fontKey, fontInfo] of Object.entries(checksumsData.fonts)) {
    const fontPath = path.join(ROOT_DIR, fontInfo.file);
    if (fs.existsSync(fontPath)) {
      const actualFont = computeSha256(fontPath);
      if (actualFont !== fontInfo.sha256) {
        console.error(`❌ CHECKSUM MISMATCH (Font: ${fontKey})`);
        console.error(`   Expected: ${fontInfo.sha256}`);
        console.error(`   Actual:   ${actualFont}`);
        hasError = true;
      } else {
        console.log(`✅ تم التحقق من خط ${fontKey} العثماني: ${actualFont}`);
      }
    }
  }
}

if (hasError) {
  console.error('🛑 فشل التحقق من سلامة النص القرآني أو الخطوط. تم إيقاف البناء فوراً.');
  process.exit(1);
}

console.log('🎉 جميع البصمات الرقمية مطابقة ومعتمدة 100%.');
process.exit(0);
