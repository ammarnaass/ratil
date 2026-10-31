'use client';

/**
 * رتل - Ratil
 * خطاف إدارة حالة وتفاعلات لوحة التحكم (Hook)
 * features/admin/hooks/useAdminDashboard.ts
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
} from '../types/admin.types';
import {
  INITIAL_RECITER_FORM,
  INITIAL_AUDIO_FORM,
  ADMIN_SECRET_STORAGE_KEY,
} from '../constants/admin.constants';
import * as adminService from '../services/admin.service';
import { useAuth } from '@/features/auth';

export function useAdminDashboard() {
  const { user, isAuthenticated: isUserLoggedIn } = useAuth();
  const isUserAdmin = Boolean(
    isUserLoggedIn && (user?.role === 'admin' || user?.email?.toLowerCase() === 'admin@dante.com')
  );

  const [adminSecret, setAdminSecret] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('reciters');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [healthData, setHealthData] = useState<HealthCheckData | null>(null);
  const [selectedReciterId, setSelectedReciterId] = useState<string>('al-minshawy');
  const [reportFilter, setReportFilter] = useState<ReportFilter>('all');

  const [showAddReciter, setShowAddReciter] = useState(false);
  const [reciterForm, setReciterForm] = useState<ReciterFormData>(INITIAL_RECITER_FORM);

  const [showAddAudio, setShowAddAudio] = useState(false);
  const [audioForm, setAudioForm] = useState<AudioFormData>(INITIAL_AUDIO_FORM);

  const showNotification = (text: string, isError = false) => {
    setStatusMessage({ text, isError });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const loadData = useCallback(async (secret: string) => {
    setIsLoading(true);
    try {
      const data = await adminService.fetchRecitersAndReports(secret);
      setReciters(data.reciters);
      setReports(data.reports);
      if (data.reciters.length > 0 && !selectedReciterId) {
        setSelectedReciterId(data.reciters[0].id);
      }
    } catch (err: any) {
      showNotification(err.message || 'تعذر تحميل البيانات', true);
    } finally {
      setIsLoading(false);
    }
  }, [selectedReciterId]);

  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_SECRET_STORAGE_KEY);
    if (saved) {
      setAdminSecret(saved);
      setIsAuthenticated(true);
      loadData(saved);
    } else if (isUserAdmin) {
      setIsAuthenticated(true);
      loadData('');
    }
  }, [loadData, isUserAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminSecret.trim()) return;

    setAuthError(null);
    setIsLoading(true);

    try {
      await adminService.verifyAdminSecret(adminSecret);
      sessionStorage.setItem(ADMIN_SECRET_STORAGE_KEY, adminSecret);
      setIsAuthenticated(true);
      loadData(adminSecret);
      showNotification('تم تسجيل الدخول إلى لوحة التحكم بنجاح');
    } catch (err: any) {
      setAuthError(err.message || 'خطأ في المصادقة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SECRET_STORAGE_KEY);
    setAdminSecret('');
    setIsAuthenticated(false);
    setReciters([]);
    setReports([]);
    setHealthData(null);
  };

  const handleCreateReciter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reciterForm.id || !reciterForm.name || !reciterForm.source_name) {
      showNotification('يرجى ملء الحقول الإلزامية', true);
      return;
    }

    setIsLoading(true);
    try {
      await adminService.createReciterApi(reciterForm, adminSecret);
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

  const handleToggleVisibility = async (reciter: Reciter) => {
    try {
      const newVisibility = reciter.is_visible === false;
      await adminService.updateReciterVisibilityApi(reciter.id, newVisibility, adminSecret);
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

  const handleDeleteReciter = async (reciterId: string, reciterName: string) => {
    if (!confirm(`هل أنت متأكد من حذف القارئ "${reciterName}" وجميع بياناته الصوتية؟`)) return;
    try {
      await adminService.deleteReciterApi(reciterId, adminSecret);
      setReciters((prev) => prev.filter((r) => r.id !== reciterId));
      showNotification(`تم حذف القارئ ${reciterName} بنجاح`);
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleUpdateReciter = async (
    id: string,
    data: Partial<ReciterFormData & { source_url?: string; is_visible?: boolean }>
  ) => {
    setIsLoading(true);
    try {
      const updated = await adminService.updateReciterApi(id, data, adminSecret);
      setReciters((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...data, ...updated } : r))
      );
      showNotification(`تم تحديث بيانات القارئ بنجاح`);
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAudio = async (param?: React.FormEvent | AudioFormData) => {
    let payload = audioForm;
    if (param && 'preventDefault' in param) {
      param.preventDefault();
    } else if (param && 'reciter_id' in param) {
      payload = param as AudioFormData;
    }

    if (!payload.reciter_id || !payload.audio_url) {
      showNotification('يرجى تحديد القارئ والرابط الصوتي', true);
      return;
    }

    setIsLoading(true);
    try {
      await adminService.saveAudioApi(payload, adminSecret);
      showNotification(`تم حفظ وتحديث رابط السورة #${payload.surah_number} بنجاح`);
      setShowAddAudio(false);
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedSurahs = async (reciterId: string, itemId?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reciters/${reciterId}/seed-surahs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminSecret ? { Authorization: `Bearer ${adminSecret}` } : {}),
        },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل بذر السور');
      showNotification(data.message || `تم بذر ${data.count} سورة بنجاح`);
      loadData(adminSecret);
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateReport = async (id: number, status: 'reviewed' | 'closed') => {
    try {
      await adminService.updateReportStatusApi(id, status, adminSecret);
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      showNotification(
        status === 'closed' ? 'تم اعتماد البلاغ كـ "محلول"' : 'تم وضع البلاغ قيد المراجعة'
      );
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleDeleteReport = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا البلاغ؟')) return;
    try {
      await adminService.deleteReportApi(id, adminSecret);
      setReports((prev) => prev.filter((r) => r.id !== id));
      showNotification('تم حذف البلاغ بنجاح');
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleRunHealthCheck = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.runHealthCheckApi(adminSecret);
      setHealthData(data);
      showNotification(`اكتمل الفحص: ${data.ok} من أصل ${data.checked} مصادر سليمة`);
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (reportFilter === 'all') return true;
    return r.status === reportFilter;
  });

  const newReportsCount = reports.filter((r) => r.status === 'new').length;

  return {
    adminSecret, setAdminSecret, isAuthenticated, isUserAdmin, currentUser: user,
    authError, activeTab, setActiveTab, isLoading, statusMessage,
    reciters, reports, filteredReports, newReportsCount, healthData,
    selectedReciterId, setSelectedReciterId, reportFilter, setReportFilter,
    showAddReciter, setShowAddReciter, reciterForm, setReciterForm,
    showAddAudio, setShowAddAudio, audioForm, setAudioForm,
    loadData, handleLogin, handleLogout,
    handleCreateReciter, handleUpdateReciter, handleToggleVisibility, handleDeleteReciter,
    handleSaveAudio, handleSeedSurahs, handleUpdateReport, handleDeleteReport, handleRunHealthCheck,
  };
}
