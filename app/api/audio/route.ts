/**
 * رتل - Ratil
 * Serverless API: إضافة وتحديث الروابط الصوتية للسور
 * app/api/audio/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

function isAdmin(req: NextRequest): boolean {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const adminSecret = process.env.ADMIN_SECRET;
  return !!adminSecret && token === adminSecret;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reciterId = searchParams.get('reciter_id');

    const rows = reciterId
      ? await sql`
          SELECT sa.*, r.name as reciter_name
          FROM surah_audio sa
          LEFT JOIN reciters r ON r.id = sa.reciter_id
          WHERE sa.reciter_id = ${reciterId}
          ORDER BY sa.surah_number ASC
        `
      : await sql`
          SELECT sa.*, r.name as reciter_name
          FROM surah_audio sa
          LEFT JOIN reciters r ON r.id = sa.reciter_id
          ORDER BY sa.reciter_id, sa.surah_number ASC
          LIMIT 342
        `;

    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { reciter_id, surah_number, audio_url, timings_url, duration_seconds, size_mb, verified } = body;

    if (!reciter_id || !surah_number || !audio_url) {
      return NextResponse.json(
        { error: 'حقول إلزامية مفقودة: reciter_id, surah_number, audio_url' },
        { status: 400 }
      );
    }

    const [row] = await sql`
      INSERT INTO surah_audio (
        reciter_id, surah_number, audio_url, timings_url, duration_seconds, size_mb, verified
      )
      VALUES (
        ${reciter_id}, ${surah_number}, ${audio_url}, ${timings_url || null}, ${duration_seconds || null}, ${size_mb || null}, ${verified ?? true}
      )
      ON CONFLICT (reciter_id, surah_number)
      DO UPDATE SET
        audio_url = EXCLUDED.audio_url,
        timings_url = EXCLUDED.timings_url,
        duration_seconds = EXCLUDED.duration_seconds,
        size_mb = EXCLUDED.size_mb,
        verified = EXCLUDED.verified
      RETURNING *
    `;

    return NextResponse.json(row, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
