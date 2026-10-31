/**
 * رتل - Ratil
 * Serverless API: تحديث وحذف بلاغ مستخدم
 * app/api/reports/[id]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { isRequestAdmin } from '@/features/admin/server';

export const dynamic = 'force-dynamic';

// ─── PATCH: تحديث حالة البلاغ وملاحظات الإدارة ─────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isRequestAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const reportId = Number(params.id);
    const body = await req.json();
    const { status, admin_notes } = body;

    const [updated] = await sql`
      UPDATE reports
      SET
        status = COALESCE(${status}, status),
        admin_notes = COALESCE(${admin_notes}, admin_notes)
      WHERE id = ${reportId}
      RETURNING *
    `;

    if (!updated) {
      return NextResponse.json({ error: 'البلاغ غير موجود' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── DELETE: حذف البلاغ ───────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isRequestAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const reportId = Number(params.id);
    await sql`DELETE FROM reports WHERE id = ${reportId}`;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
