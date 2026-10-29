/**
 * رتل - Ratil
 * Serverless API: إنشاء حساب جديد وتوليد جلسة المستخدم
 * app/api/auth/register/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { hashPassword } from '@/features/auth/utils/crypto';
import { signToken } from '@/features/auth/utils/token';
import { validateRegisterInput } from '@/features/auth/validators/auth.validator';
import { AUTH_COOKIE_NAME, AUTH_TOKEN_EXPIRY_DAYS } from '@/features/auth/constants/auth.constants';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    const validation = validateRegisterInput({ name, email, password });
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // التأكد من توفر الاتصال بـ Neon
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { success: false, error: 'الاتصال بقاعدة بيانات Neon غير متوفر حالياً' },
        { status: 503 }
      );
    }

    // فحص ما إذا كان البريد مسجلاً مسبقاً
    const existing = await sql`
      SELECT id FROM users WHERE email = ${normalizedEmail} LIMIT 1
    `;
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني مسجل بالفعل' },
        { status: 409 }
      );
    }

    // فحص عدد المستخدمين، إن كان الأول يمنح صلاحية المشرف
    const countRes = await sql`SELECT COUNT(*)::int as count FROM users`;
    const isFirstUser = countRes && countRes[0]?.count === 0;
    const role = isFirstUser ? 'admin' : 'user';

    const passwordHash = await hashPassword(password);

    const [newUser] = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name.trim()}, ${normalizedEmail}, ${passwordHash}, ${role})
      RETURNING id, name, email, role, avatar_url, created_at
    `;

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const response = NextResponse.json(
      { success: true, user: newUser, token },
      { status: 201 }
    );

    // تثبيت الكوكي الآمن في المتصفح
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
    console.error('Registration error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'حدث خطأ أثناء إنشاء الحساب' },
      { status: 500 }
    );
  }
}
