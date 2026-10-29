/**
 * رتل - Ratil
 * استعلامات الروابط الصوتية من Neon PostgreSQL و Archive.org
 * lib/queries/audio.ts
 */

import sql from '../db';
import type { SurahAudio } from '../types';
import localReciters from '../../data/reciters.json';

// سورة واحدة لقارئ محدد
export async function getSurahAudio(
  reciterId: string,
  surahNumber: number
): Promise<SurahAudio | null> {
  try {
    if (process.env.DATABASE_URL) {
      const [row] = await sql`
        SELECT sa.*, r.name AS reciter_name, r.riwaya
        FROM surah_audio sa
        JOIN reciters r ON r.id = sa.reciter_id
        WHERE sa.reciter_id = ${reciterId}
          AND sa.surah_number = ${surahNumber}
          AND sa.verified = true
      `;
      if (row) return row as SurahAudio;
    }
  } catch (err) {
    console.warn(`Neon DB query for audio ${reciterId}/${surahNumber} fallback:`, err);
  }

  // وضع Archive.org المباشر
  const reciter = localReciters.find((r: any) => r.id === reciterId);
  const pad = String(surahNumber).padStart(3, '0');

  return {
    reciter_id: reciterId,
    surah_number: surahNumber,
    audio_url: `https://archive.org/download/ratil-${reciterId}/${pad}.mp3`,
    verified: true,
    reciter_name: reciter?.name || reciter?.name_ar || reciterId,
    riwaya: reciter?.riwaya || 'hafs',
  };
}

// كل السور المتاحة لأي قارئ (للـ SSG)
export async function getAllAvailableAudio(): Promise<{ reciter_id: string; surah_number: number }[]> {
  try {
    if (process.env.DATABASE_URL) {
      const rows = await sql`
        SELECT reciter_id, surah_number
        FROM surah_audio
        WHERE verified = true
      `;
      if (rows && rows.length > 0) return rows as any;
    }
  } catch (err) {
    console.warn('Neon DB query for all audio fallback:', err);
  }

  // احتياطي SSG لجميع السور الـ 114 للقرّاء المعتمدين
  const pairs: { reciter_id: string; surah_number: number }[] = [];
  for (const r of localReciters) {
    for (let s = 1; s <= 114; s++) {
      pairs.push({ reciter_id: r.id, surah_number: s });
    }
  }
  return pairs;
}
