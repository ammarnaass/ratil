import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { isRequestAdmin, getAdminActor } from '@/features/admin/server';
import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

function updateLocalUser(id: string, updates: any) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'local-users.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const users = JSON.parse(content || '{}');
      for (const email of Object.keys(users)) {
        if (users[email].id === id) {
          users[email] = { ...users[email], ...updates };
          fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf-8');
          return users[email];
        }
      }
    }
  } catch (err) {
    console.warn('Failed to update local-users.json:', err);
  }
  return null;
}

function deleteLocalUser(id: string) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'local-users.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const users = JSON.parse(content || '{}');
      for (const email of Object.keys(users)) {
        if (users[email].id === id) {
          delete users[email];
          fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf-8');
          return true;
        }
      }
    }
  } catch (err) {
    console.warn('Failed to delete local user:', err);
  }
  return false;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isRequestAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = params.id;
  const body = await req.json();
  const { role, status } = body;
  const actor = getAdminActor(req);

  try {
    if (process.env.DATABASE_URL) {
      const [updated] = await sql`
        UPDATE users
        SET
          role = COALESCE(${role}, role),
          status = COALESCE(${status}, status),
          updated_at = NOW()
        WHERE id = ${userId}
        RETURNING id, name, email, role, status
      `;

      if (updated) {
        // تسجيل في سجل الرقابة والتدقيق
        try {
          await sql`
            INSERT INTO admin_audit_logs (admin_id, admin_name, action, target_type, target_id, details)
            VALUES (${actor.id}, ${actor.name}, 'update_user', 'user', ${userId}, ${JSON.stringify(body)})
          `;
        } catch {}

        return NextResponse.json(updated);
      }
    }
  } catch (err: any) {
    console.warn('Neon DB update user fallback to local:', err);
  }

  const updatedLocal = updateLocalUser(userId, { role, status });
  if (updatedLocal) {
    return NextResponse.json(updatedLocal);
  }

  return NextResponse.json({ error: 'تعذر العثور على المستخدم' }, { status: 404 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isRequestAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = params.id;
  const actor = getAdminActor(req);

  try {
    if (process.env.DATABASE_URL) {
      await sql`DELETE FROM users WHERE id = ${userId}`;
      try {
        await sql`
          INSERT INTO admin_audit_logs (admin_id, admin_name, action, target_type, target_id, details)
          VALUES (${actor.id}, ${actor.name}, 'delete_user', 'user', ${userId}, '{}')
        `;
      } catch {}
      return NextResponse.json({ success: true, deleted: userId });
    }
  } catch (err: any) {
    console.warn('Neon DB delete user fallback to local:', err);
  }

  const deleted = deleteLocalUser(userId);
  return NextResponse.json({ success: deleted, deleted: userId });
}
