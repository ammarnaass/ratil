/**
 * رتل - Ratil
 * مستودع بيانات المستخدمين في قاعدة بيانات Neon (User Repository)
 * features/auth/services/user.repository.ts
 */

import { sql } from '@/lib/db';
import type { User } from '../types/auth.types';

export interface DbUserRecord {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role?: 'admin' | 'user';
  avatar?: string | null;
  created_at?: string;
  updated_at?: string;
}

import fs from 'fs';
import path from 'path';

const LOCAL_USERS_FILE = path.join(process.cwd(), 'data', 'local-users.json');

function readLocalUsers(): Record<string, DbUserRecord> {
  try {
    if (fs.existsSync(LOCAL_USERS_FILE)) {
      const content = fs.readFileSync(LOCAL_USERS_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('Could not read local users file:', err);
  }
  return {};
}

function writeLocalUsers(users: Record<string, DbUserRecord>): void {
  try {
    fs.writeFileSync(LOCAL_USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not write local users file:', err);
  }
}

export async function findUserByEmail(email: string): Promise<DbUserRecord | null> {
  const normalizedEmail = email.trim().toLowerCase();

  if (process.env.DATABASE_URL) {
    try {
      const rows = await sql`
        SELECT id::text, name, email, password_hash, role, COALESCE(avatar_url, NULL) as avatar, created_at, updated_at
        FROM users
        WHERE LOWER(email) = ${normalizedEmail}
        LIMIT 1;
      `;
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          id: String(r.id),
          name: r.name,
          email: r.email,
          password_hash: r.password_hash,
          role: (r.role as 'admin' | 'user') || (normalizedEmail === 'admin@dante.com' ? 'admin' : 'user'),
          avatar: r.avatar,
          created_at: r.created_at,
          updated_at: r.updated_at,
        };
      }
    } catch (err) {
      console.warn('Database query failed, checking local users store:', (err as any)?.message);
    }
  }

  const local = readLocalUsers();
  const user = local[normalizedEmail];
  if (user) {
    return {
      ...user,
      role: user.role || (normalizedEmail === 'admin@dante.com' ? 'admin' : 'user'),
    };
  }
  return null;
}

export async function findUserById(id: string): Promise<User | null> {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await sql`
        SELECT id::text, name, email, role, COALESCE(avatar_url, NULL) as avatar, created_at
        FROM users
        WHERE id::text = ${String(id)}
        LIMIT 1;
      `;
      if (rows && rows.length > 0) {
        const u = rows[0];
        return {
          id: String(u.id),
          name: u.name,
          email: u.email,
          role: (u.role as 'admin' | 'user') || (u.email === 'admin@dante.com' ? 'admin' : 'user'),
          avatar: u.avatar,
          createdAt: u.created_at,
        };
      }
    } catch (err) {
      console.warn('Database query by ID failed, checking local store:', (err as any)?.message);
    }
  }

  const local = readLocalUsers();
  for (const record of Object.values(local)) {
    if (String(record.id) === String(id)) {
      return {
        id: record.id,
        name: record.name,
        email: record.email,
        role: record.role || (record.email === 'admin@dante.com' ? 'admin' : 'user'),
        avatar: record.avatar,
        createdAt: record.created_at,
      };
    }
  }

  return null;
}

export async function createUser(data: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role?: 'admin' | 'user';
  avatar?: string;
}): Promise<User> {
  const normalizedEmail = data.email.trim().toLowerCase();
  const role: 'admin' | 'user' = data.role || (normalizedEmail === 'admin@dante.com' ? 'admin' : 'user');

  if (process.env.DATABASE_URL) {
    try {
      await sql`
        INSERT INTO users (name, email, password_hash, role, avatar_url)
        VALUES (${data.name.trim()}, ${normalizedEmail}, ${data.passwordHash}, ${role}, ${data.avatar || null})
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role,
          updated_at = NOW();
      `;
    } catch (err) {
      console.warn('Database insert failed, persisting to local store:', (err as any)?.message);
    }
  }

  const record: DbUserRecord = {
    id: data.id,
    name: data.name.trim(),
    email: normalizedEmail,
    password_hash: data.passwordHash,
    role,
    avatar: data.avatar || null,
    created_at: new Date().toISOString(),
  };

  const local = readLocalUsers();
  local[normalizedEmail] = record;
  writeLocalUsers(local);

  return {
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role,
    avatar: record.avatar,
    createdAt: record.created_at,
  };
}
