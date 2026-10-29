/**
 * رتل - Ratil
 * Serverless API: فحص مصادر صوت Archive.org وتسجيل صحة الروابط
 * app/api/health/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

function isAdmin(req: NextRequest): boolean {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const adminSecret = process.env.ADMIN_SECRET;
  return !!adminSecret && token === adminSecret;
}

// ─── GET: فحص مصادر Archive.org وتسجيل صحتها ───────────────
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let surahs: any[] = [];
    try {
      surahs = await sql`
        SELECT DISTINCT ON (reciter_id)
          reciter_id, audio_url
        FROM surah_audio
        WHERE verified = true
        ORDER BY reciter_id, surah_number
      `;
    } catch {
      // Fallback test list
      surahs = [
        { reciter_id: 'al-minshawy', audio_url: 'https://archive.org/download/ratil-al-minshawy-hafs/001.mp3' },
        { reciter_id: 'al-husary', audio_url: 'https://archive.org/download/ratil-al-husary-warsh/001.mp3' },
      ];
    }

    if (surahs.length === 0) {
      surahs = [
        { reciter_id: 'al-minshawy', audio_url: 'https://archive.org/download/ratil-al-minshawy-hafs/001.mp3' },
      ];
    }

    const results = await Promise.allSettled(
      surahs.map(async (row) => {
        const start = Date.now();
        let status = 0;
        let ok = false;
        let errorMsg = '';

        try {
          const res = await fetch(row.audio_url, {
            method: 'HEAD',
            headers: { Range: 'bytes=0-1023' },
            signal: AbortSignal.timeout(8000),
          });
          status = res.status;
          ok = res.status === 206 || res.status === 200;
        } catch (e: any) {
          errorMsg = e.message || 'Fetch timeout';
        }

        const ms = Date.now() - start;

        // تسجيل في Neon إذا كان الاتصال نشطاً
        try {
          await sql`
            INSERT INTO health_logs
              (reciter_id, audio_url, http_status, supports_range, response_ms, error_msg)
            VALUES
              (${row.reciter_id}, ${row.audio_url}, ${status}, ${ok}, ${ms}, ${errorMsg || null})
          `;
        } catch {
          // Ignored if table not yet created
        }

        return { reciter_id: row.reciter_id, audio_url: row.audio_url, status, ok, ms, error: errorMsg || undefined };
      })
    );

    const checked = results.length;
    const okCount = results.filter(
      (r) => r.status === 'fulfilled' && (r.value as any).ok
    ).length;

    return NextResponse.json({
      checked,
      ok: okCount,
      results: results.map((r) =>
        r.status === 'fulfilled' ? r.value : { error: r.reason }
      ),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
