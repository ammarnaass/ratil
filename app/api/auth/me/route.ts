/**
 * رتل - Ratil
 * Serverless API: استرجاع الملف الشخصي للمستخدم الحالي
 * app/api/auth/me/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/features/auth/utils/token';
import { AUTH_COOKIE_NAME } from '@/features/auth/constants/auth.constants';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    const headerToken = req.headers.get('Authorization')?.replace('Bearer ', '');
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      // وضع بديل آمن إن كانت الجلسة صحيحة بدون Neon نشط
      return NextResponse.json({
        success: true,
        user: {
          id: payload.userId,
          name: payload.email.split('@')[0],
          email: payload.email,
          role: payload.role,
        },
      });
    }

    const [user] = await sql`
      SELECT id, name, email, role, avatar_url, created_at, updated_at
      FROM users
      WHERE id = ${payload.userId}
      LIMIT 1
    `;

    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
