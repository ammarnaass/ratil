/**
 * رتل - Ratil
 * Serverless API: مزامنة المحفوظات وتقدم الاستماع مع سحابة Neon
 * app/api/auth/sync/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/features/auth/utils/token';
import { AUTH_COOKIE_NAME } from '@/features/auth/constants/auth.constants';

export const dynamic = 'force-dynamic';

function getUserId(req: NextRequest): number | null {
  const cookieToken = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const headerToken = req.headers.get('Authorization')?.replace('Bearer ', '');
  const token = cookieToken || headerToken;
  if (!token) return null;

  const payload = verifyToken(token);
  return payload ? payload.userId : null;
}

// ─── GET: جلب المحفوظات والموضع السحابي ─────────────────────
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ bookmarks: [], lastPlayed: null });
  }

  try {
    const bookmarks = await sql`
      SELECT id, surah_id, ayah_number, ayah_text, riwaya, created_at
      FROM user_bookmarks
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    const [lastPlayed] = await sql`
      SELECT reciter_id, surah_number, ayah_number, progress_seconds, updated_at
      FROM user_playback_progress
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    return NextResponse.json({
      success: true,
      bookmarks: bookmarks || [],
      lastPlayed: lastPlayed || null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── POST: مزامنة ودمج المحفوظات وتقدم الاستماع ──────────────
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: true, message: 'Local mode active' });
  }

  try {
    const body = await req.json();
    const { bookmarks, lastPlayed } = body;

    // مزامنة المحفوظات
    let syncedBookmarksCount = 0;
    if (Array.isArray(bookmarks)) {
      for (const b of bookmarks) {
        if (b.surahId && b.ayahNumber) {
          await sql`
            INSERT INTO user_bookmarks (user_id, surah_id, ayah_number, ayah_text, riwaya)
            VALUES (${userId}, ${b.surahId}, ${b.ayahNumber}, ${b.ayahText || null}, ${b.riwaya || 'hafs'})
            ON CONFLICT (user_id, surah_id, ayah_number)
            DO UPDATE SET
              ayah_text = COALESCE(EXCLUDED.ayah_text, user_bookmarks.ayah_text),
              riwaya = EXCLUDED.riwaya
          `;
          syncedBookmarksCount++;
        }
      }
    }

    // مزامنة آخر موضع استماع
    let lastPlayedSynced = false;
    if (lastPlayed && lastPlayed.reciterId && lastPlayed.surahNumber) {
      await sql`
        INSERT INTO user_playback_progress (
          user_id, reciter_id, surah_number, ayah_number, progress_seconds, updated_at
        )
        VALUES (
          ${userId}, ${lastPlayed.reciterId}, ${lastPlayed.surahNumber},
          ${lastPlayed.ayahNumber || 1}, ${lastPlayed.progressSeconds || 0}, NOW()
        )
        ON CONFLICT (user_id)
        DO UPDATE SET
          reciter_id = EXCLUDED.reciter_id,
          surah_number = EXCLUDED.surah_number,
          ayah_number = EXCLUDED.ayah_number,
          progress_seconds = EXCLUDED.progress_seconds,
          updated_at = NOW()
      `;
      lastPlayedSynced = true;
    }

    return NextResponse.json({
      success: true,
      bookmarksCount: syncedBookmarksCount,
      lastPlayedSynced,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
