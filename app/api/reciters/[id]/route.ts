/**
 * رتل - Ratil
 * Serverless API: إدارة قارئ محدد (GET, PUT, DELETE)
 * app/api/reciters/[id]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

function isAdmin(req: NextRequest): boolean {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const adminSecret = process.env.ADMIN_SECRET;
  return !!adminSecret && token === adminSecret;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [reciter] = await sql`
      SELECT * FROM reciters WHERE id = ${params.id}
    `;
    if (!reciter) {
      return NextResponse.json({ error: 'القارئ غير موجود' }, { status: 404 });
    }
    return NextResponse.json(reciter);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, riwaya, license, source_name, source_url, is_visible, notes } = body;

    const [updated] = await sql`
      UPDATE reciters
      SET
        name = COALESCE(${name}, name),
        riwaya = COALESCE(${riwaya}, riwaya),
        license = COALESCE(${license}, license),
        source_name = COALESCE(${source_name}, source_name),
        source_url = COALESCE(${source_url}, source_url),
        is_visible = COALESCE(${is_visible}, is_visible),
        notes = COALESCE(${notes}, notes),
        updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `;

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await sql`
      DELETE FROM reciters WHERE id = ${params.id}
    `;
    return NextResponse.json({ success: true, deleted: params.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
