/**
 * رتل - Ratil
 * استعلامات بلاغات الأخطاء والتصحيحات العلمية
 * lib/queries/reports.ts
 */

import sql from '../db';
import type { Report } from '../types';

export async function createReport(report: Omit<Report, 'id' | 'created_at' | 'status'>): Promise<Report | null> {
  try {
    const [row] = await sql`
      INSERT INTO reports (type, surah_number, ayah_number, reciter_id, description)
      VALUES (${report.type}, ${report.surah_number || null}, ${report.ayah_number || null}, ${report.reciter_id || null}, ${report.description})
      RETURNING *
    `;
    return row as Report;
  } catch (err) {
    console.error('Error creating report in Neon DB:', err);
    return null;
  }
}

export async function getReports(status?: string): Promise<Report[]> {
  try {
    if (status) {
      const rows = await sql`
        SELECT * FROM reports WHERE status = ${status} ORDER BY created_at DESC
      `;
      return rows as Report[];
    }
    const rows = await sql`
      SELECT * FROM reports ORDER BY created_at DESC
    `;
    return rows as Report[];
  } catch (err) {
    console.error('Error fetching reports from Neon DB:', err);
    return [];
  }
}
