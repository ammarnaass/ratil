import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  AUTH_COOKIE_NAME,
  verifySessionToken,
  findUserById,
} from '@/features/auth/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    // جلب أحدث بيانات المستخدم من المستودع
    const user = await findUserById(payload.userId);
    if (!user) {
      return NextResponse.json({
        success: true,
        user: {
          id: payload.userId,
          name: payload.name,
          email: payload.email,
          role: payload.role || (payload.email === 'admin@dante.com' ? 'admin' : 'user'),
          avatar: payload.avatar,
        },
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Me API error:', error);
    return NextResponse.json({ success: false, user: null }, { status: 500 });
  }
}
