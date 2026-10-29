/**
 * رتل - Ratil
 * Serverless API: إرسال واستعراض بلاغات الأخطاء العلمية
 * app/api/reports/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

function isAdmin(req: NextRequest): boolean {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const adminSecret = process.env.ADMIN_SECRET;
  return !!adminSecret && token === adminSecret;
}

// ─── GET: استعراض البلاغات (للمدير) ────────────────────────
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const reports = await sql`
      SELECT * FROM reports ORDER BY created_at DESC LIMIT 100
    `;
    return NextResponse.json(reports);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── POST: إرسال بلاغ من مستخدم ──────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, surah_number, ayah_number, reciter_id, description } = body;

    if (!type || !description || description.trim().length < 5) {
      return NextResponse.json({ error: 'وصف البلاغ غير كافٍ (يجب أن يكون ٥ أحرف على الأقل)' }, { status: 400 });
    }

    // Rate limiting بسيط (5 بلاغات بالساعة)
    try {
      const recent = await sql`
        SELECT COUNT(*) as cnt FROM reports
        WHERE created_at > NOW() - INTERVAL '1 hour'
      `;
      if (recent && Number(recent[0]?.cnt) > 20) {
        return NextResponse.json({ error: 'تم إرسال عدد كبير من البلاغات مؤخراً. يرجى المحاولة لاحقاً.' }, { status: 429 });
      }
    } catch {
      // Ignore rate limit check error if table empty or in transit
    }

    const [row] = await sql`
      INSERT INTO reports (type, surah_number, ayah_number, reciter_id, description)
      VALUES (${type}, ${surah_number || null}, ${ayah_number || null}, ${reciter_id || null}, ${description})
      RETURNING *
    `;

    return NextResponse.json({ success: true, report: row }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
