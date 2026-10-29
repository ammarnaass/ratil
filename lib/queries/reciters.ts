/**
 * رتل - Ratil
 * استعلامات القرّاء من Neon PostgreSQL
 * lib/queries/reciters.ts
 */

import sql from '../db';
import type { Reciter, SurahAudio } from '../types';
import localReciters from '../../data/reciters.json';

// جميع القرّاء المرئيين مع عدد السور المتاحة
export async function getVisibleReciters(): Promise<Reciter[]> {
  try {
    if (process.env.DATABASE_URL) {
      const rows = await sql`
        SELECT
          r.*,
          COUNT(sa.id)::int AS surah_count
        FROM reciters r
        LEFT JOIN surah_audio sa
          ON sa.reciter_id = r.id AND sa.verified = true
        WHERE r.is_visible = true
        GROUP BY r.id
        ORDER BY surah_count DESC, r.name
      `;
      if (rows && rows.length > 0) {
        return rows as Reciter[];
      }
    }
  } catch (err) {
    console.warn('Neon DB query fallback to local static reciters:', err);
  }

  // وضع احتياطي آمن وقت البناء الثابت
  return localReciters.map((r: any) => ({
    id: r.id,
    name: r.name || r.name_ar,
    riwaya: r.riwaya,
    license: r.license,
    source_name: r.source || 'Archive.org Collection',
    source_url: r.base_url || `https://archive.org/download/ratil-${r.id}/`,
    is_visible: true,
    surah_count: 114,
  })) as Reciter[];
}

// قارئ واحد مع سوره المتاحة
export async function getReciterWithSurahs(id: string): Promise<(Reciter & { surahs: SurahAudio[] }) | null> {
  try {
    if (process.env.DATABASE_URL) {
      const [reciter] = await sql`
        SELECT * FROM reciters WHERE id = ${id}
      `;
      if (reciter) {
        const surahs = await sql`
          SELECT surah_number, audio_url, timings_url, duration_seconds, size_mb
          FROM surah_audio
          WHERE reciter_id = ${id} AND verified = true
          ORDER BY surah_number
        `;
        return { ...(reciter as Reciter), surahs: (surahs || []) as SurahAudio[] };
      }
    }
  } catch (err) {
    console.warn(`Neon DB query for reciter ${id} fallback:`, err);
  }

  // احتياطي محلي
  const local = localReciters.find((r: any) => r.id === id);
  if (!local) return null;

  const mockSurahs: SurahAudio[] = Array.from({ length: 114 }, (_, i) => {
    const sNum = i + 1;
    const pad = String(sNum).padStart(3, '0');
    return {
      reciter_id: local.id,
      surah_number: sNum,
      audio_url: `https://archive.org/download/ratil-${local.id}/${pad}.mp3`,
      verified: true,
    };
  });

  return {
    id: local.id,
    name: local.name || local.name_ar,
    riwaya: local.riwaya,
    license: local.license,
    source_name: local.source,
    source_url: local.base_url,
    is_visible: true,
    surah_count: 114,
    surahs: mockSurahs,
  };
}

// للـ SSG — جلب كل IDs المرئيين
export async function getAllReciterIds(): Promise<string[]> {
  try {
    if (process.env.DATABASE_URL) {
      const rows = await sql`
        SELECT id FROM reciters WHERE is_visible = true
      `;
      if (rows && rows.length > 0) {
        return rows.map((r: any) => r.id);
      }
    }
  } catch (err) {
    console.warn('Neon DB query for all reciter ids fallback:', err);
  }

  return localReciters.map((r: any) => r.id);
}
