/**
 * رتل - Ratil
 * مجمع الحالة ومنطق لوحة تحكم الإدارة
 * features/admin/hooks/useAdminDashboard.ts
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  AdminTab,
  AdminReciter,
  AdminSurahAudio,
  AdminReport,
  HealthCheckResult,
  IntegrityCheckResponse,
} from '../types/admin.types';
import { adminService } from '../services/admin.service';
import { ADMIN_AUTH_STORAGE_KEY } from '../constants/admin.constants';

export function useAdminDashboard() {
  const [token, setToken] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('integrity');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // البيانات
  const [reciters, setReciters] = useState<AdminReciter[]>([]);
  const [audioList, setAudioList] = useState<AdminSurahAudio[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [healthData, setHealthData] = useState<HealthCheckResult | null>(null);
  const [integrityData, setIntegrityData] = useState<IntegrityCheckResponse | null>(null);

  // استرجاع الرمز السري من التخزين المحلي إن وجد
  useEffect(() => {
    const savedToken = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    if (savedToken && savedToken.trim().length > 0) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const showStatus = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const loadAllData = useCallback(async (authToken: string) => {
    if (!authToken) return;
    setIsLoading(true);
    try {
      const [recList, repList, integ] = await Promise.allSettled([
        adminService.getReciters(authToken),
        adminService.getReports(authToken),
        adminService.getIntegrityCheck(),
      ]);

      if (recList.status === 'fulfilled') setReciters(recList.value);
      if (repList.status === 'fulfilled') setReports(repList.value);
      if (integ.status === 'fulfilled') setIntegrityData(integ.value);
    } catch (e: any) {
      console.warn('Error loading admin data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadAllData(token);
    }
  }, [isAuthenticated, token, loadAllData]);

  const handleLogin = (secretKey: string) => {
    const cleanKey = secretKey.trim();
    if (!cleanKey) return;
    setToken(cleanKey);
    setIsAuthenticated(true);
    localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, cleanKey);
    loadAllData(cleanKey);
    showStatus('تم التحقق بنجاح والدخول للوحة الحوكمة والتحكم.', 'success');
  };

  const handleLogout = () => {
    setToken('');
    setIsAuthenticated(false);
    localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
    showStatus('تم تسجيل الخروج وقفل جلسة الإدارة.', 'info');
  };

  const refreshIntegrity = async () => {
    try {
      const data = await adminService.getIntegrityCheck();
      setIntegrityData(data);
      showStatus('تم تحديث نتائج فحص البصمات المرجعية SHA-256.', 'success');
    } catch {
      showStatus('تعذر فحص البصمات حالياً.', 'error');
    }
  };

  const runHealthCheck = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await adminService.runHealthCheck(token);
      setHealthData(data);
      showStatus(`اكتمل فحص مصادر Archive.org: ${data.ok} من أصل ${data.checked} متاحة وسريعة.`, 'success');
    } catch (err: any) {
      showStatus(err.message || 'فشل فحص الصحة واستجابة الخوادم.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const createReciter = async (data: Partial<AdminReciter>) => {
    if (!token) return;
    try {
      await adminService.createReciter(token, data);
      showStatus('تمت إضافة القارئ بنجاح إلى قاعدة بيانات Neon.', 'success');
      loadAllData(token);
    } catch (err: any) {
      showStatus(err.message || 'فشل إضافة القارئ.', 'error');
    }
  };

  const toggleReciterVisibility = async (reciter: AdminReciter) => {
    if (!token) return;
    try {
      await adminService.updateReciter(token, reciter.id, { is_visible: !reciter.is_visible });
      showStatus(`تم تغيير حالة ظهور القارئ "${reciter.name}".`, 'success');
      loadAllData(token);
    } catch (err: any) {
      showStatus(err.message || 'فشل تحديث الحالة.', 'error');
    }
  };

  const resolveReport = async (reportId: number, status: 'reviewed' | 'closed') => {
    if (!token) return;
    try {
      await adminService.updateReportStatus(token, reportId, status);
      showStatus(`تم اعتماد وحل البلاغ رقم #${reportId}.`, 'success');
      loadAllData(token);
    } catch (err: any) {
      showStatus(err.message || 'فشل تحديث حالة البلاغ.', 'error');
    }
  };

  return {
    token,
    isAuthenticated,
    activeTab,
    setActiveTab,
    isLoading,
    statusMessage,
    reciters,
    audioList,
    reports,
    healthData,
    integrityData,
    handleLogin,
    handleLogout,
    refreshIntegrity,
    runHealthCheck,
    createReciter,
    toggleReciterVisibility,
    resolveReport,
    reload: () => loadAllData(token),
  };
}
