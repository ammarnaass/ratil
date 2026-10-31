'use client';

/**
 * رتل - Ratil
 * خطاف جلب وتحديث سجل التدقيق الإداري (Admin Audit Logs Hook)
 * features/admin/hooks/useAdminAudit.ts
 */

import { useState, useEffect, useCallback } from 'react';
import type { AuditLogItem } from '../types/admin.types';
import * as adminService from '../services/admin.service';

export function useAdminAudit(adminSecret: string, isAuthenticated: boolean) {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadAuditLogs = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.fetchAuditLogsApi(adminSecret);
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'تعذر جلب سجل التدقيق');
    } finally {
      setIsLoading(false);
    }
  }, [adminSecret, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAuditLogs();
    }
  }, [isAuthenticated, loadAuditLogs]);

  return {
    logs,
    isLoading,
    error,
    loadAuditLogs,
  };
}

export default useAdminAudit;
