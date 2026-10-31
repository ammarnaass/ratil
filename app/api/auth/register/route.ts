import { NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  validateRegister,
  findUserByEmail,
  createUser,
  hashPassword,
  createSessionToken,
  AUTH_COOKIE_NAME,
  AUTH_MESSAGES,
} from '@/features/auth/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = validateRegister(body);

    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0];
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const existingUser = await findUserByEmail(body.email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: AUTH_MESSAGES.USER_EXISTS },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(body.password);
    const userId = `usr_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;

    const user = await createUser({
      id: userId,
      name: body.name,
      email: body.email,
      passwordHash,
    });

    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    });

    const response = NextResponse.json({
      success: true,
      message: AUTH_MESSAGES.REGISTER_SUCCESS,
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
    console.error('Registration API error:', error);
    return NextResponse.json(
      { success: false, error: AUTH_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
}
