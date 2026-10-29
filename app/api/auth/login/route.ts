/**
 * رتل - Ratil
 * Serverless API: تسجيل الدخول والتحقق من كلمة المرور
 * app/api/auth/login/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyPassword } from '@/features/auth/utils/crypto';
import { signToken } from '@/features/auth/utils/token';
import { validateLoginInput } from '@/features/auth/validators/auth.validator';
import { AUTH_COOKIE_NAME, AUTH_TOKEN_EXPIRY_DAYS } from '@/features/auth/constants/auth.constants';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const validation = validateLoginInput({ email, password });
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { success: false, error: 'الاتصال بقاعدة بيانات Neon غير متوفر حالياً' },
        { status: 503 }
      );
    }

    const [user] = await sql`
      SELECT id, name, email, password_hash, role, avatar_url, created_at
      FROM users
      WHERE email = ${normalizedEmail}
      LIMIT 1
    `;

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
    };

    const response = NextResponse.json({
      success: true,
      user: userProfile,
      token,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: AUTH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}
