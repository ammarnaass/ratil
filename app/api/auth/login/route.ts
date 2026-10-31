import { NextResponse } from 'next/server';
import {
  validateLogin,
  findUserByEmail,
  verifyPassword,
  createSessionToken,
  AUTH_COOKIE_NAME,
  AUTH_MESSAGES,
} from '@/features/auth/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = validateLogin(body);

    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0];
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const dbUser = await findUserByEmail(body.email);
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: AUTH_MESSAGES.INVALID_CREDENTIALS },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(body.password, dbUser.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: AUTH_MESSAGES.INVALID_CREDENTIALS },
        { status: 401 }
      );
    }

    const user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role || (dbUser.email === 'admin@dante.com' ? 'admin' : 'user'),
      avatar: dbUser.avatar,
      createdAt: dbUser.created_at,
    };

    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    });

    const response = NextResponse.json({
      success: true,
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
      user,
    });

    // تعيين الكوكي الآمن HTTP-only
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: AUTH_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
}
