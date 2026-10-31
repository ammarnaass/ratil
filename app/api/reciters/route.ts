/**
 * رتل - Ratil
 * Serverless API: إدارة القرّاء في Neon PostgreSQL
 * app/api/reciters/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

import { isRequestAdmin } from '@/features/admin/server';

export const dynamic = 'force-dynamic';

// ─── GET: قائمة القرّاء (للمدير مع تفاصيل الحوكمة أو عامة) ──
export async function GET(req: NextRequest) {
  try {
    const adminMode = isRequestAdmin(req);

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
  if (!isRequestAdmin(req)) {
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

    // مزامنة الملف الاحتياطي المحلي
    try {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'data', 'reciters.json');
      if (fs.existsSync(filePath)) {
        const localList = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (!localList.some((r: any) => r.id === id)) {
          localList.push({
            id,
            name,
            name_ar: name,
            riwaya,
            license,
            source: source_name,
            base_url: source_url || '',
          });
          fs.writeFileSync(filePath, JSON.stringify(localList, null, 2), 'utf8');
        }
      }
    } catch (syncErr) {
      console.warn('Could not sync reciters.json:', syncErr);
    }

    // إعادة التحقق من الكاش الفوري لصفحات القرّاء والرئيسية
    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/');
      revalidatePath('/reciters');
      revalidatePath(`/reciter/${id}`);
    } catch {}

    return NextResponse.json(reciter, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Database insertion error' }, { status: 500 });
  }
}
