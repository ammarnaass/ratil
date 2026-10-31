import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { isRequestAdmin } from '@/features/admin/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isRequestAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (process.env.DATABASE_URL) {
      const rows = await Promise.race([
        sql`
          SELECT id, admin_id, admin_name, action, target_type, target_id, details, created_at
          FROM admin_audit_logs
          ORDER BY created_at DESC
          LIMIT 50
        `,
        new Promise<any[]>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000)),
      ]);

      if (rows && rows.length > 0) {
        return NextResponse.json(rows);
      }
    }
  } catch (err) {
    console.warn('Neon DB audit logs fallback:', err);
  }

  // سجل افتراضي أولي للمعاينة الحية
  const sampleLogs = [
    {
      id: 1,
      admin_id: 'usr_admin',
      admin_name: 'مدير النظام',
      action: 'seed_surahs',
      target_type: 'reciter',
      target_id: 'fares_abed',
      details: { count: 114, source: 'Archive.org 483568356837_gmail_001' },
      created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    },
    {
      id: 2,
      admin_id: 'usr_admin',
      admin_name: 'مدير النظام',
      action: 'update_reciter',
      target_type: 'reciter',
      target_id: 'al-minshawy',
      details: { field: 'source_url', value: 'ratil-al-minshawy-hafs' },
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: 3,
      admin_id: 'usr_admin',
      admin_name: 'مدير النظام',
      action: 'resolve_report',
      target_type: 'report',
      target_id: 'rep_14',
      details: { note: 'تم تدقيق التوقيت واعتماده' },
      created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    },
  ];

  return NextResponse.json(sampleLogs);
}
