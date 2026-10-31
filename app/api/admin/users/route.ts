import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { isRequestAdmin } from '@/features/admin/server';
import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

function getLocalUsers() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'local-users.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content || '{}');
      return Object.values(parsed).map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role || (u.email?.toLowerCase() === 'admin@dante.com' ? 'admin' : 'user'),
        status: u.status || 'active',
        avatar: u.avatar || null,
        last_login_at: u.last_login_at || null,
        login_count: u.login_count || 1,
        created_at: u.created_at || new Date().toISOString(),
      }));
    }
  } catch (err) {
    console.warn('Failed to read local-users.json:', err);
  }
  return [];
}

export async function GET(req: NextRequest) {
  if (!isRequestAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized — يتطلب صلاحيات الإدارة' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.toLowerCase().trim();
  const role = searchParams.get('role');
  const status = searchParams.get('status');

  try {
    if (process.env.DATABASE_URL) {
      const rows = await Promise.race([
        sql`
          SELECT id, name, email, role, status, avatar, last_login_at, login_count, created_at
          FROM users
          ORDER BY created_at DESC
        `,
        new Promise<any[]>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 2500)
        ),
      ]);

      if (rows && rows.length > 0) {
        let list = rows;
        if (search) {
          list = list.filter((u: any) =>
            u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
          );
        }
        if (role && role !== 'all') {
          list = list.filter((u: any) => u.role === role);
        }
        if (status && status !== 'all') {
          list = list.filter((u: any) => u.status === status);
        }
        return NextResponse.json(list);
      }
    }
  } catch (err) {
    console.warn('Neon DB users query fallback to local:', err);
  }

  // Fallback محلي
  let localList = getLocalUsers();
  if (search) {
    localList = localList.filter((u) =>
      u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
    );
  }
  if (role && role !== 'all') {
    localList = localList.filter((u) => u.role === role);
  }
  if (status && status !== 'all') {
    localList = localList.filter((u) => u.status === status);
  }

  return NextResponse.json(localList);
}
