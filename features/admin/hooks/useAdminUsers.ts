'use client';

/**
 * رتل - Ratil
 * خطاف إدارة ومراقبة المستخدمين (Admin Users Hook)
 * features/admin/hooks/useAdminUsers.ts
 */

import { useState, useEffect, useCallback } from 'react';
import type { AdminUserItem } from '../types/admin.types';
import * as adminService from '../services/admin.service';

export function useAdminUsers(adminSecret: string, isAuthenticated: boolean) {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.fetchUsersApi(adminSecret);
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'تعذر جلب المستخدمين');
    } finally {
      setIsLoading(false);
    }
  }, [adminSecret, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated, loadUsers]);

  const handleUpdateUser = async (
    userId: string,
    data: { role: 'admin' | 'moderator' | 'user'; status: 'active' | 'suspended' }
  ) => {
    setIsLoading(true);
    try {
      const updated = await adminService.updateUserRoleStatusApi(userId, data, adminSecret);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...updated } : u))
      );
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`هل أنت متأكد من حذف حساب "${userName}" نهائياً؟`)) return;
    setIsLoading(true);
    try {
      await adminService.deleteUserApi(userId, adminSecret);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    isLoading,
    error,
    loadUsers,
    handleUpdateUser,
    handleDeleteUser,
  };
}

export default useAdminUsers;
