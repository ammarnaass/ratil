import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, AUTH_MESSAGES } from '@/features/auth/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: AUTH_MESSAGES.LOGOUT_SUCCESS,
  });

  // مسح الكوكي
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
