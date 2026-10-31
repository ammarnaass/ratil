'use client';

/**
 * رتل - Ratil
 * خطاف جلب وتحديث إحصائيات التنزيل والاستماع (Admin Analytics Hook)
 * features/admin/hooks/useAdminAnalytics.ts
 */

import { useState, useEffect, useCallback } from 'react';
import type { AnalyticsOverview } from '../types/admin.types';
import * as adminService from '../services/admin.service';

export function useAdminAnalytics(adminSecret: string, isAuthenticated: boolean) {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.fetchAnalyticsApi(adminSecret);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'تعذر جلب الإحصائيات');
    } finally {
      setIsLoading(false);
    }
  }, [adminSecret, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAnalytics();
    }
  }, [isAuthenticated, loadAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    loadAnalytics,
  };
}

export default useAdminAnalytics;
