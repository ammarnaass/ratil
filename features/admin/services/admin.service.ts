/**
 * رتل - Ratil
 * خدمة استدعاءات خادم الإدارة (Admin API Service)
 * features/admin/services/admin.service.ts
 */

import type { Reciter, Report } from '@/lib/types';
import type {
  HealthCheckData,
  ReciterFormData,
  AudioFormData,
  AdminUserItem,
  AnalyticsOverview,
  AuditLogItem,
} from '../types/admin.types';

export function getAdminHeaders(secret?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (secret && secret.trim()) {
    headers['Authorization'] = `Bearer ${secret.trim()}`;
  }
  return headers;
}

export async function fetchRecitersAndReports(secret: string): Promise<{
  reciters: Reciter[];
  reports: Report[];
}> {
  const [recitersRes, reportsRes] = await Promise.all([
    fetch('/api/reciters', { headers: getAdminHeaders(secret) }),
    fetch('/api/reports', { headers: getAdminHeaders(secret) }),
  ]);

  if (recitersRes.status === 401 || reportsRes.status === 401) {
    throw new Error('مفتاح الإدارة غير صالح (Unauthorized)');
  }

  const reciters = recitersRes.ok ? await recitersRes.json() : [];
  const reports = reportsRes.ok ? await reportsRes.json() : [];

  return {
    reciters: Array.isArray(reciters) ? reciters : [],
    reports: Array.isArray(reports) ? reports : [],
  };
}

export async function verifyAdminSecret(secret: string): Promise<boolean> {
  const res = await fetch('/api/reciters', { headers: getAdminHeaders(secret) });
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('رمز ADMIN_SECRET غير صحيح. تأكد من إعدادات البيئة.');
    }
    throw new Error('فشل التحقق من مفتاح الإدارة');
  }
  return true;
}

export async function createReciterApi(data: ReciterFormData, secret: string): Promise<void> {
  const res = await fetch('/api/reciters', {
    method: 'POST',
    headers: getAdminHeaders(secret),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'فشل حفظ القارئ');
  }
}

export async function updateReciterApi(
  id: string,
  data: Partial<ReciterFormData & { source_url?: string; is_visible?: boolean }>,
  secret: string
): Promise<Reciter> {
  const res = await fetch(`/api/reciters/${id}`, {
    method: 'PUT',
    headers: getAdminHeaders(secret),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'فشل تحديث بيانات القارئ');
  }
  return res.json();
}

export async function updateReciterVisibilityApi(
  id: string,
  isVisible: boolean,
  secret: string
): Promise<void> {
  const res = await fetch(`/api/reciters/${id}`, {
    method: 'PUT',
    headers: getAdminHeaders(secret),
    body: JSON.stringify({ is_visible: isVisible }),
  });
  if (!res.ok) throw new Error('فشل تحديث حالة القارئ');
}

export async function deleteReciterApi(id: string, secret: string): Promise<void> {
  const res = await fetch(`/api/reciters/${id}`, {
    method: 'DELETE',
    headers: getAdminHeaders(secret),
  });
  if (!res.ok) throw new Error('فشل حذف القارئ');
}

export async function fetchReciterAudio(
  reciterId: string,
  secret?: string
): Promise<any[]> {
  const res = await fetch(`/api/audio?reciter_id=${reciterId}`, {
    headers: getAdminHeaders(secret),
  });
  if (!res.ok) return [];
  return res.json();
}

export async function saveAudioApi(data: AudioFormData, secret: string): Promise<void> {
  const res = await fetch('/api/audio', {
    method: 'POST',
    headers: getAdminHeaders(secret),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'فشل حفظ الرابط الصوتي');
  }
}

export async function updateReportStatusApi(
  id: number,
  status: 'reviewed' | 'closed',
  secret: string
): Promise<void> {
  const res = await fetch(`/api/reports/${id}`, {
    method: 'PATCH',
    headers: getAdminHeaders(secret),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('فشل تحديث حالة البلاغ');
}

export async function deleteReportApi(id: number, secret: string): Promise<void> {
  const res = await fetch(`/api/reports/${id}`, {
    method: 'DELETE',
    headers: getAdminHeaders(secret),
  });
  if (!res.ok) throw new Error('فشل حذف البلاغ');
}

export async function runHealthCheckApi(secret: string): Promise<HealthCheckData> {
  const res = await fetch('/api/health', { headers: getAdminHeaders(secret) });
  if (!res.ok) throw new Error('فشل تشغيل فحص Archive.org');
  return res.json();
}

export async function fetchUsersApi(
  secret: string,
  params?: { search?: string; role?: string; status?: string }
): Promise<AdminUserItem[]> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.role) qs.set('role', params.role);
  if (params?.status) qs.set('status', params.status);

  const res = await fetch(`/api/admin/users?${qs.toString()}`, {
    headers: getAdminHeaders(secret),
  });
  if (!res.ok) throw new Error('فشل جلب قائمة المستخدمين');
  return res.json();
}

export async function updateUserRoleStatusApi(
  userId: string,
  data: { role?: string; status?: string },
  secret: string
): Promise<AdminUserItem> {
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    headers: getAdminHeaders(secret),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'فشل تحديث حالة المستخدم');
  }
  return res.json();
}

export async function deleteUserApi(userId: string, secret: string): Promise<void> {
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getAdminHeaders(secret),
  });
  if (!res.ok) throw new Error('فشل حذف حساب المستخدم');
}

export async function fetchAnalyticsApi(secret: string): Promise<AnalyticsOverview> {
  const res = await fetch('/api/admin/analytics', {
    headers: getAdminHeaders(secret),
  });
  if (!res.ok) throw new Error('فشل جلب بيانات التحليلات والإحصائيات');
  return res.json();
}

export async function fetchAuditLogsApi(secret: string): Promise<AuditLogItem[]> {
  const res = await fetch('/api/admin/audit-logs', {
    headers: getAdminHeaders(secret),
  });
  if (!res.ok) throw new Error('فشل جلب سجلات التدقيق الإداري');
  return res.json();
}

