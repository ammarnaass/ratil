'use client';

/**
 * رتل - Ratil
 * تبويب مراقبة وإدارة المستخدمين والحسابات
 * features/admin/components/UsersTab.tsx
 */

import React, { useState, useMemo } from 'react';
import { Users, Search, Download, ShieldCheck, UserPlus } from 'lucide-react';
import type { AdminUserItem } from '../types/admin.types';
import { UserCardItem } from './UserCardItem';
import { EditUserRoleModal } from './EditUserRoleModal';

export interface UsersTabProps {
  users: AdminUserItem[];
  isLoading: boolean;
  onUpdateUser: (userId: string, data: { role: 'admin' | 'moderator' | 'user'; status: 'active' | 'suspended' }) => Promise<void> | void;
  onDeleteUser: (userId: string, userName: string) => Promise<void> | void;
}

export function UsersTab({
  users,
  isLoading,
  onUpdateUser,
  onDeleteUser,
}: UsersTabProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'moderator' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !search.trim() ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleExportCSV = () => {
    const headers = ['المعرف', 'الاسم', 'البريد الإلكتروني', 'الرتبة', 'الحالة', 'تاريخ الانضمام'];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${u.name}"`,
      u.email,
      u.role,
      u.status,
      u.created_at,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ratil-users-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeCount = users.filter((u) => u.status !== 'suspended').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. ترويسة التبويب وإحصائيات سريعة */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-on-surface">إدارة ومراقبة المستخدمين</h2>
            <p className="text-[11px] text-on-surface-variant">
              إجمالي الحسابات: <strong className="text-primary font-mono">{users.length}</strong> ({activeCount} نشط · {adminCount} مدراء)
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs text-on-surface font-semibold transition-all border border-surface-container-highest shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-primary" />
          <span>تصدير المستخدمين (CSV)</span>
        </button>
      </div>

      {/* 2. شريط البحث والفلترة */}
      <div className="p-4 rounded-2xl bg-surface-container border border-surface-container-high flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-outline absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم أو البريد الإلكتروني..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-9 pl-3 py-2 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest text-xs outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="p-2 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest text-xs"
          >
            <option value="all">كل الرتب</option>
            <option value="admin">مدير نظام</option>
            <option value="moderator">مشرف محتوى</option>
            <option value="user">مستخدم عادي</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="p-2 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest text-xs"
          >
            <option value="all">كل الحالات</option>
            <option value="active">نشط فقط</option>
            <option value="suspended">مجمد فقط</option>
          </select>
        </div>
      </div>

      {/* 3. جدول المستخدمين */}
      <div className="rounded-2xl bg-surface-container border border-surface-container-high overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-surface-container-high text-on-surface-variant border-b border-surface-container-highest">
              <tr>
                <th className="p-3.5">المستخدم والبريد</th>
                <th className="p-3.5">الرتبة</th>
                <th className="p-3.5">الحالة</th>
                <th className="p-3.5">تاريخ الانضمام</th>
                <th className="p-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant text-xs">
                    لا يوجد مستخدمون مطابقون لمعايير البحث
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <UserCardItem
                    key={user.id}
                    user={user}
                    onEditRole={(u) => setEditingUser(u)}
                    onToggleStatus={(u) => {
                      const newStatus = u.status === 'suspended' ? 'active' : 'suspended';
                      onUpdateUser(u.id, { role: u.role, status: newStatus });
                    }}
                    onDelete={(u) => onDeleteUser(u.id, u.name)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. نافذة تعديل الرتبة */}
      {editingUser && (
        <EditUserRoleModal
          isOpen={Boolean(editingUser)}
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={onUpdateUser}
        />
      )}
    </div>
  );
}

export default UsersTab;
