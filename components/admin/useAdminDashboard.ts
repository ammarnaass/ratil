'use client';

/**
 * رتل - Ratil
 * Hook إدارة حالة وعمليات لوحة التحكم المركزية
 * components/admin/useAdminDashboard.ts
 */

import { useState, useEffect, useCallback } from 'react';
import type { Reciter, Report } from '@/lib/types';
import type {
  TabType,
  HealthCheckData,
  ReciterFormData,
  AudioFormData,
  ReportFilter,
  StatusMessage,
} from './types';
import { INITIAL_RECITER_FORM, INITIAL_AUDIO_FORM } from './constants';

export function useAdminDashboard() {
  const [adminSecret, setAdminSecret] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('reciters');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

  // بيانات اللوحة
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [healthData, setHealthData] = useState<HealthCheckData | null>(null);
  const [selectedReciterId, setSelectedReciterId] = useState<string>('al-minshawy');
  const [reportFilter, setReportFilter] = useState<ReportFilter>('all');

  // نماذج الإدخال
  const [showAddReciter, setShowAddReciter] = useState(false);
  const [reciterForm, setReciterForm] = useState<ReciterFormData>(INITIAL_RECITER_FORM);

  const [showAddAudio, setShowAddAudio] = useState(false);
  const [audioForm, setAudioForm] = useState<AudioFormData>(INITIAL_AUDIO_FORM);

  const showNotification = (text: string, isError = false) => {
    setStatusMessage({ text, isError });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const getHeaders = useCallback(
    (secret = adminSecret) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
    }),
    [adminSecret]
  );

  // جلب البيانات من Neon
  const loadData = useCallback(
    async (secret: string) => {
      setIsLoading(true);
      try {
        const [recitersRes, reportsRes] = await Promise.all([
          fetch('/api/reciters', { headers: getHeaders(secret) }),
          fetch('/api/reports', { headers: getHeaders(secret) }),
        ]);

        if (recitersRes.status === 401 || reportsRes.status === 401) {
          throw new Error('مفتاح الإدارة غير صالح (Unauthorized)');
        }

        if (recitersRes.ok) {
          const recitersData = await recitersRes.json();
          setReciters(Array.isArray(recitersData) ? recitersData : []);
          if (recitersData.length > 0 && !selectedReciterId) {
            setSelectedReciterId(recitersData[0].id);
          }
        }

        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          setReports(Array.isArray(reportsData) ? reportsData : []);
        }
      } catch (err: any) {
        showNotification(err.message || 'تعذر تحميل البيانات من خادم Neon', true);
      } finally {
        setIsLoading(false);
      }
    },
    [getHeaders, selectedReciterId]
  );

  // التحقق التلقائي من الجلسة عند التحميل
  useEffect(() => {
    const saved = sessionStorage.getItem('ratil_admin_secret');
    if (saved) {
      setAdminSecret(saved);
      setIsAuthenticated(true);
      loadData(saved);
    }
  }, [loadData]);

  // تسجيل الدخول
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminSecret.trim()) return;

    setAuthError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/reciters', { headers: getHeaders(adminSecret) });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('رمز ADMIN_SECRET غير صحيح. تأكد من إعدادات البيئة.');
        }
        throw new Error('فشل التحقق من مفتاح الإدارة');
      }

      sessionStorage.setItem('ratil_admin_secret', adminSecret);
      setIsAuthenticated(true);
      loadData(adminSecret);
      showNotification('تم تسجيل الدخول إلى لوحة التحكم بنجاح');
    } catch (err: any) {
      setAuthError(err.message || 'خطأ في المصادقة');
    } finally {
      setIsLoading(false);
    }
  };

  // تسجيل الخروج
  const handleLogout = () => {
    sessionStorage.removeItem('ratil_admin_secret');
    setAdminSecret('');
    setIsAuthenticated(false);
    setReciters([]);
    setReports([]);
    setHealthData(null);
  };

  // إدارة القرّاء: إضافة قارئ
  const handleCreateReciter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reciterForm.id || !reciterForm.name || !reciterForm.source_name) {
      showNotification('يرجى ملء الحقول الإلزامية', true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/reciters', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(reciterForm),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'فشل حفظ القارئ');
      }

      showNotification('تمت إضافة القارئ الجديد بنجاح');
      setShowAddReciter(false);
      setReciterForm(INITIAL_RECITER_FORM);
      loadData(adminSecret);
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setIsLoading(false);
    }
  };

  // تبديل إظهار القارئ
  const handleToggleVisibility = async (reciter: Reciter) => {
    try {
      const newVisibility = reciter.is_visible === false;
      const res = await fetch(`/api/reciters/${reciter.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ is_visible: newVisibility }),
      });

      if (!res.ok) throw new Error('فشل تحديث حالة القارئ');

      setReciters((prev) =>
        prev.map((r) => (r.id === reciter.id ? { ...r, is_visible: newVisibility } : r))
      );
      showNotification(
        newVisibility ? `تم إظهار القارئ ${reciter.name}` : `تم إخفاء القارئ ${reciter.name}`
      );
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // حذف قارئ
  const handleDeleteReciter = async (reciterId: string, reciterName: string) => {
    if (!confirm(`هل أنت متأكد من حذف القارئ "${reciterName}" وجميع بياناته الصوتية؟`)) return;

    try {
      const res = await fetch(`/api/reciters/${reciterId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!res.ok) throw new Error('فشل حذف القارئ');

      setReciters((prev) => prev.filter((r) => r.id !== reciterId));
      showNotification(`تم حذف القارئ ${reciterName} بنجاح`);
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // إدارة الصوتيات: حفظ رابط سورة
  const handleSaveAudio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioForm.reciter_id || !audioForm.audio_url) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/audio', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(audioForm),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'فشل حفظ الرابط الصوتي');
      }

      showNotification(`تم حفظ رابط السورة ${audioForm.surah_number} بنجاح`);
      setShowAddAudio(false);
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setIsLoading(false);
    }
  };

  // معالجة البلاغات
  const handleUpdateReport = async (id: number, status: 'reviewed' | 'closed') => {
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('فشل تحديث حالة البلاغ');

      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      showNotification(
        status === 'closed' ? 'تم اعتماد البلاغ كـ "محلول"' : 'تم وضع البلاغ قيد المراجعة'
      );
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // حذف بلاغ
  const handleDeleteReport = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا البلاغ؟')) return;
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!res.ok) throw new Error('فشل حذف البلاغ');

      setReports((prev) => prev.filter((r) => r.id !== id));
      showNotification('تم حذف البلاغ بنجاح');
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // تشغيل فحص روابط Archive.org
  const handleRunHealthCheck = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/health', { headers: getHeaders() });
      if (!res.ok) throw new Error('فشل تشغيل فحص Archive.org');

      const data = await res.json();
      setHealthData(data);
      showNotification(`اكتمل الفحص: ${data.ok} من أصل ${data.checked} مصادر سليمة`);
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setIsLoading(false);
    }
  };

  // تصفية البلاغات
  const filteredReports = reports.filter((r) => {
    if (reportFilter === 'all') return true;
    return r.status === reportFilter;
  });

  const newReportsCount = reports.filter((r) => r.status === 'new').length;

  return {
    adminSecret,
    setAdminSecret,
    isAuthenticated,
    authError,
    activeTab,
    setActiveTab,
    isLoading,
    statusMessage,
    reciters,
    reports,
    filteredReports,
    newReportsCount,
    healthData,
    selectedReciterId,
    setSelectedReciterId,
    reportFilter,
    setReportFilter,
    showAddReciter,
    setShowAddReciter,
    reciterForm,
    setReciterForm,
    showAddAudio,
    setShowAddAudio,
    audioForm,
    setAudioForm,
    loadData,
    handleLogin,
    handleLogout,
    handleCreateReciter,
    handleToggleVisibility,
    handleDeleteReciter,
    handleSaveAudio,
    handleUpdateReport,
    handleDeleteReport,
    handleRunHealthCheck,
  };
}
