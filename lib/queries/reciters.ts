/**
 * رتل - Ratil
 * استعلامات القرّاء من Neon PostgreSQL
 * lib/queries/reciters.ts
 */

import sql from '../db';
import type { Reciter, SurahAudio } from '../types';
import localReciters from '../../data/reciters.json';

function withTimeout<T = any>(promise: Promise<T> | PromiseLike<T>, ms: number = 3000): Promise<T> {
  return Promise.race([
    promise as Promise<T>,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Database query timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// جميع القرّاء المرئيين مع عدد السور المتاحة
export async function getVisibleReciters(): Promise<Reciter[]> {
  try {
    if (process.env.DATABASE_URL) {
      const rows = await withTimeout<any[]>(
        sql`
          SELECT
            r.*,
            COUNT(sa.id)::int AS surah_count
          FROM reciters r
          LEFT JOIN surah_audio sa
            ON sa.reciter_id = r.id AND sa.verified = true
          WHERE r.is_visible = true
          GROUP BY r.id
          ORDER BY surah_count DESC, r.name
        `,
        3000
      );

      if (rows && rows.length > 0) {
        return rows as Reciter[];
      }
    }
  } catch (err) {
    console.warn('Neon DB query for getVisibleReciters failed, falling back to local file:', err);
  }

  // احتياطي محلي في حال انقطاع الشبكة أو تعذر الاتصال بـ Neon
  return (localReciters as any[])
    .filter((r) => r.is_visible !== false)
    .map((r) => ({
      id: r.id,
      name: r.name || r.name_ar,
      riwaya: r.riwaya,
      license: r.license,
      source_name: r.source || r.source_name,
      source_url: r.base_url || r.source_url,
      is_visible: r.is_visible ?? true,
      surah_count: r.surah_count ?? 114,
    }));
}

// قارئ واحد مع سوره المتاحة
export async function getReciterWithSurahs(id: string): Promise<(Reciter & { surahs: SurahAudio[] }) | null> {
  try {
    if (process.env.DATABASE_URL) {
      const reciterRows = await withTimeout<any[]>(
        sql`
          SELECT * FROM reciters WHERE id = ${id}
        `,
        3000
      );
      const reciter = reciterRows?.[0];
      if (reciter) {
        const surahs = await withTimeout<any[]>(
          sql`
            SELECT surah_number, audio_url, timings_url, duration_seconds, size_mb
            FROM surah_audio
            WHERE reciter_id = ${id} AND verified = true
            ORDER BY surah_number
          `,
          3000
        );
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
      const rows = await withTimeout<any[]>(
        sql`
          SELECT id FROM reciters WHERE is_visible = true
        `,
        3000
      );
      if (rows && rows.length > 0) {
        return rows.map((r: any) => r.id);
      }
    }
  } catch (err) {
    console.warn('Neon DB query for all reciter ids fallback:', err);
  }

  return localReciters.map((r: any) => r.id);
}
