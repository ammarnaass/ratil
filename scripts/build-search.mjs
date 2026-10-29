#!/usr/bin/env node
/**
 * رتل - Ratil
 * توليد فهرس البحث العربي المُطبَّع لـ MiniSearch
 * scripts/build-search.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

export function normalizeArabic(text) {
  if (!text) return '';
  return text
    // إزالة التشكيل وعلامات الضبط القرآني
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    // توحيد الهمزات والألف الخنجرية
    .replace(/[أإآٱ]/g, 'ا')
    // توحيد الياء والألف المقصورة
    .replace(/ى/g, 'ي')
    // توحيد التاء المربوطة والهاء
    .replace(/ة/g, 'ه')
    // إزالة التطويل
    .replace(/ـ/g, '')
    .trim();
}

const LATIN_MAP = {
  fatiha: 1, baqarah: 2, baqara: 2, imran: 3, nisa: 4, maidah: 5,
  anam: 6, araf: 7, anfal: 8, tawbah: 9, yunus: 10,
  hud: 11, yusuf: 12, rad: 13, ibrahim: 14, hijr: 15,
  nahl: 16, isra: 17, kahf: 18, maryam: 19, taha: 20,
  anbiya: 21, hajj: 22, muminun: 23, nur: 24, furqan: 25,
  shuara: 26, naml: 27, qasas: 28, ankabut: 29, rum: 30,
  luqman: 31, sajda: 32, sajdah: 32, ahzab: 33, saba: 34, fatir: 35,
  yasin: 36, yaseen: 36, saffat: 37, sad: 38, zumar: 39, ghafir: 40,
  fussilat: 41, shura: 42, zukhruf: 43, dukhan: 44, jathiya: 45,
  ahqaf: 46, muhammad: 47, fath: 48, hujurat: 49, qaf: 50,
  dhariyat: 51, tur: 52, najm: 53, qamar: 54, rahman: 55,
  waqiah: 56, waqia: 56, hadid: 57, mujadila: 58, hashr: 59,
  mumtahanah: 60, saff: 61, jumuah: 62, munafiqun: 63, taghabun: 64,
  talaq: 65, tahrim: 66, mulk: 67, qalam: 68, haqqah: 69,
  maarij: 70, nuh: 71, jinn: 72, muzzammil: 73, muddathir: 74,
  qiyamah: 75, insan: 76, mursalat: 77, naba: 78, naziat: 79,
  abasa: 80, takwir: 81, infitar: 82, mutaffifin: 83, inshiqaq: 84,
  buruj: 85, tariq: 86, ala: 87, ghashiyah: 88, fajr: 89,
  balad: 90, shams: 91, layl: 92, duha: 93, sharh: 94,
  tin: 95, alaq: 96, qadr: 97, bayyinah: 98, zalzalah: 99,
  adiyat: 100, qariah: 101, takathur: 102, asr: 103, humazah: 104,
  fil: 105, quraysh: 106, maun: 107, kawthar: 108, kafirun: 109,
  nasr: 110, masad: 111, ikhlas: 112, falaq: 113, nas: 114,
};

const surahsFile = path.join(ROOT_DIR, 'data/surahs.json');
const surahs = JSON.parse(fs.readFileSync(surahsFile, 'utf8'));

const index = surahs.map(s => {
  const sId = s.id;
  const nameAr = s.ar || s.name_ar || '';
  const nameEn = s.en || s.name_en || '';
  const latinAliases = Object.entries(LATIN_MAP)
    .filter(([_, id]) => id === sId)
    .map(([alias]) => alias);

  return {
    id: sId,
    name: nameAr,
    name_ar: nameAr,
    name_normalized: normalizeArabic(nameAr),
    name_en: nameEn,
    latin: latinAliases,
    num: sId,
    surah_number: sId,
    ayahs: s.ayahs || s.ayahs_hafs || 0,
    ayahs_hafs: s.ayahs_hafs || s.ayahs || 0,
    ayahs_warsh: s.ayahs_warsh || s.ayahs || 0,
    type: s.type || 'مكية',
    page: s.page || 1,
    searchText: `${sId} ${nameAr} ${normalizeArabic(nameAr)} ${nameEn} ${latinAliases.join(' ')}`,
  };
});

const publicDir = path.join(ROOT_DIR, 'public');
fs.mkdirSync(publicDir, { recursive: true });

const outPath = path.join(publicDir, 'search-index.json');
fs.writeFileSync(outPath, JSON.stringify(index, null, 2), 'utf8');

console.log(`🔍 تم توليد فهرس البحث بنجاح (${index.length} سورة) في ${outPath}`);
