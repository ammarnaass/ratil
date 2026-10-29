/**
 * رتل - Ratil
 * Serverless API: إدارة القرّاء في Neon PostgreSQL
 * app/api/reciters/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

function isAdmin(req: NextRequest): boolean {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const adminSecret = process.env.ADMIN_SECRET;
  return !!adminSecret && token === adminSecret;
}

// ─── GET: قائمة القرّاء (للمدير مع تفاصيل الحوكمة أو عامة) ──
export async function GET(req: NextRequest) {
  try {
    const adminMode = isAdmin(req);

    if (adminMode) {
      // للمدير: كل القرّاء بما في ذلك غير المرئيين
      const reciters = await sql`
        SELECT r.*, COUNT(sa.id)::int AS surah_count
        FROM reciters r
        LEFT JOIN surah_audio sa ON sa.reciter_id = r.id
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `;
      return NextResponse.json(reciters);
    } else {
      // للعامة: القرّاء المعتمدون والمرئيون فقط
      const reciters = await sql`
        SELECT r.id, r.name, r.riwaya, r.license, r.source_name, r.source_url, COUNT(sa.id)::int AS surah_count
        FROM reciters r
        LEFT JOIN surah_audio sa ON sa.reciter_id = r.id AND sa.verified = true
        WHERE r.is_visible = true
        GROUP BY r.id
        ORDER BY surah_count DESC, r.name
      `;
      return NextResponse.json(reciters);
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Database error' }, { status: 500 });
  }
}

// ─── POST: إضافة قارئ جديد (محمي برمز المدير) ───────────────
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized — يتطلب تصريح المدير' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, name, riwaya, license, source_name, source_url, notes } = body;

    if (!id || !name || !riwaya || !license || !source_name) {
      return NextResponse.json({ error: 'حقول إلزامية مفقودة (id, name, riwaya, license, source_name)' }, { status: 400 });
    }

    const [reciter] = await sql`
      INSERT INTO reciters (id, name, riwaya, license, source_name, source_url, notes, is_visible)
      VALUES (${id}, ${name}, ${riwaya}, ${license}, ${source_name}, ${source_url || null}, ${notes || null}, true)
      RETURNING *
    `;

    return NextResponse.json(reciter, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Database insertion error' }, { status: 500 });
  }
}
