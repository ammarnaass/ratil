/**
 * رتل - Ratil
 * طبقة خدمات التواصل مع APIs الإدارية
 * features/admin/services/admin.service.ts
 */

import type {
  AdminReciter,
  AdminSurahAudio,
  AdminReport,
  HealthCheckResult,
  IntegrityCheckResponse,
} from '../types/admin.types';

function getAuthHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export const adminService = {
  // فحص سلامة النص القرآني المعتمد
  async getIntegrityCheck(): Promise<IntegrityCheckResponse> {
    const res = await fetch('/api/integrity');
    if (!res.ok) throw new Error('فشل جلب نتائج التحقق التشفيري');
    return res.json();
  },

  // جلب القرّاء من Neon
  async getReciters(token: string): Promise<AdminReciter[]> {
    const res = await fetch('/api/reciters', {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error('فشل جلب قائمة القرّاء');
    return res.json();
  },

  // إضافة قارئ جديد إلى Neon
  async createReciter(token: string, data: Partial<AdminReciter>): Promise<AdminReciter> {
    const res = await fetch('/api/reciters', {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'فشل حفظ القارئ');
    }
    return res.json();
  },

  // تحديث بيانات قارئ
  async updateReciter(token: string, id: string, data: Partial<AdminReciter>): Promise<AdminReciter> {
    const res = await fetch(`/api/reciters/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('فشل تحديث بيانات القارئ');
    return res.json();
  },

  // جلب الملفات الصوتية
  async getAudioList(reciterId?: string): Promise<AdminSurahAudio[]> {
    const url = reciterId ? `/api/audio?reciter_id=${reciterId}` : '/api/audio';
    const res = await fetch(url);
    if (!res.ok) throw new Error('فشل جلب قائمة الملفات الصوتية');
    return res.json();
  },

  // إضافة أو تحديث ملف صوتي
  async saveSurahAudio(token: string, data: Partial<AdminSurahAudio>): Promise<AdminSurahAudio> {
    const res = await fetch('/api/audio', {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('فشل حفظ بيانات السورة الصوتية');
    return res.json();
  },

  // تشغيل فحص صحة واستجابة Archive.org
  async runHealthCheck(token: string): Promise<HealthCheckResult> {
    const res = await fetch('/api/health', {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error('فشل فحص روابط البث المباشر');
    return res.json();
  },

  // جلب البلاغات
  async getReports(token: string): Promise<AdminReport[]> {
    const res = await fetch('/api/reports', {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error('فشل جلب البلاغات');
    return res.json();
  },

  // تحديث حالة البلاغ
  async updateReportStatus(
    token: string,
    id: number,
    status: 'new' | 'reviewed' | 'closed',
    adminNotes?: string
  ): Promise<AdminReport> {
    const res = await fetch(`/api/reports/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ status, admin_notes: adminNotes }),
    });
    if (!res.ok) throw new Error('فشل تحديث حالة البلاغ');
    return res.json();
  },
};
