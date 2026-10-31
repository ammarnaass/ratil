/**
 * رتل - Ratil
 * Serverless API: بذر وتوليد كافة سور المصحف (114 سورة) لقارئ محدد في Neon PostgreSQL
 * app/api/reciters/[id]/seed-surahs/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { isRequestAdmin } from '@/features/admin/server';
import { extractArchiveItemId, buildSurahDirectUrl } from '@/features/audio';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isRequestAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized — يتطلب صلاحيات المدير' }, { status: 401 });
  }

  const reciterId = params.id;
  if (!reciterId) {
    return NextResponse.json({ error: 'معرف القارئ مفقود' }, { status: 400 });
  }

  try {
    // 1. التحقق من وجود القارئ في قاعدة البيانات
    const [reciter] = await sql`
      SELECT id, name, source_url FROM reciters WHERE id = ${reciterId}
    `;

    if (!reciter) {
      return NextResponse.json({ error: `القارئ ${reciterId} غير مسجل في قاعدة البيانات` }, { status: 404 });
    }

    // 2. قراءة بيانات الطلب (اختيارية)
    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const rawItemId = body.itemId || body.archive_id || reciter.source_url;
    const itemId = extractArchiveItemId(rawItemId, reciterId);

    if (!itemId) {
      return NextResponse.json({
        error: 'تعذر تحديد معرف مجموعة Archive.org للقارئ. يرجى تمرير itemId صالح.',
      }, { status: 400 });
    }

    const fromSurah = Math.max(1, Math.min(114, Number(body.from) || 1));
    const toSurah = Math.max(fromSurah, Math.min(114, Number(body.to) || 114));

    // 3. بذر السور في جدول surah_audio
    let seededCount = 0;
    for (let sNum = fromSurah; sNum <= toSurah; sNum++) {
      const audioUrl = buildSurahDirectUrl(itemId, sNum);
      await sql`
        INSERT INTO surah_audio (reciter_id, surah_number, audio_url, verified)
        VALUES (${reciterId}, ${sNum}, ${audioUrl}, true)
        ON CONFLICT (reciter_id, surah_number)
        DO UPDATE SET audio_url = EXCLUDED.audio_url, verified = true
      `;
      seededCount++;
    }

    // 4. تحديث رابط المصدر في جدول القرّاء إن تم تمرير معرف أو كان فارغاً
    if (itemId) {
      await sql`
        UPDATE reciters
        SET source_url = ${`https://archive.org/details/${itemId}`}
        WHERE id = ${reciterId}
      `;
    }

    // 5. إبطال الكاش فورياً لضمان انعكاس التغييرات
    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/');
      revalidatePath('/reciters');
      revalidatePath(`/reciter/${reciterId}`);
      for (let s = fromSurah; s <= Math.min(fromSurah + 3, toSurah); s++) {
        revalidatePath(`/reciter/${reciterId}/surah/${s}`);
      }
    } catch {}

    const sampleUrl = buildSurahDirectUrl(itemId, 1);

    return NextResponse.json({
      success: true,
      count: seededCount,
      reciterId,
      itemId,
      sampleUrl,
      message: `تم بذر وتحديث ${seededCount} سورة بنجاح للقارئ ${reciter.name}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Database seeding error' }, { status: 500 });
  }
}
