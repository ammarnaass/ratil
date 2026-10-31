import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      event_type,
      reciter_id,
      surah_number,
      duration_played = 0,
      device_type = 'desktop',
    } = body;

    if (!event_type || !reciter_id || !surah_number) {
      return NextResponse.json({ ok: false, error: 'بيانات غير مكتملة' }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      await Promise.race([
        sql`
          INSERT INTO audio_events (
            event_type, reciter_id, surah_number, duration_played, device_type
          )
          VALUES (
            ${event_type}, ${reciter_id}, ${surah_number}, ${duration_played}, ${device_type}
          )
        `,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000)),
      ]).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
