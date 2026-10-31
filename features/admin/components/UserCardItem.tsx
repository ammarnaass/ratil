'use client';

/**
 * رتل - Ratil
 * سطر عرض المستخدم في جدول الإدارة
 * features/admin/components/UserCardItem.tsx
 */

import React from 'react';
import { Shield, ShieldAlert, User, Edit2, Ban, CheckCircle, Trash2 } from 'lucide-react';
import type { AdminUserItem } from '../types/admin.types';

export interface UserCardItemProps {
  user: AdminUserItem;
  onEditRole: (user: AdminUserItem) => void;
  onToggleStatus: (user: AdminUserItem) => void;
  onDelete: (user: AdminUserItem) => void;
}

export function UserCardItem({
  user,
  onEditRole,
  onToggleStatus,
  onDelete,
}: UserCardItemProps) {
  const isSuspended = user.status === 'suspended';
  const roleLabel =
    user.role === 'admin'
      ? 'مدير نظام'
      : user.role === 'moderator'
      ? 'مشرف محتوى'
      : 'قارئ ومستمع';

  const roleBadgeStyle =
    user.role === 'admin'
      ? 'bg-primary/10 text-primary border-primary/20'
      : user.role === 'moderator'
      ? 'bg-secondary/10 text-secondary border-secondary/20'
      : 'bg-surface-container-highest text-on-surface-variant border-surface-container-highest';

  return (
    <tr className="hover:bg-surface-container-high/40 transition-colors">
      <td className="p-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            {user.name.charAt(0) || 'م'}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-on-surface text-xs">{user.name}</span>
            <span className="text-[10px] text-outline font-mono truncate max-w-[180px]">{user.email}</span>
          </div>
        </div>
      </td>

      <td className="p-3.5">
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${roleBadgeStyle}`}>
          {user.role === 'admin' ? (
            <ShieldAlert className="w-3 h-3" />
          ) : user.role === 'moderator' ? (
            <Shield className="w-3 h-3" />
          ) : (
            <User className="w-3 h-3" />
          )}
          <span>{roleLabel}</span>
        </span>
      </td>

      <td className="p-3.5">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 border ${
            isSuspended
              ? 'bg-error/10 text-error border-error/20'
              : 'bg-primary/10 text-primary border-primary/20'
          }`}
        >
          {isSuspended ? 'مجمد / محظور' : 'نشط'}
        </span>
      </td>

      <td className="p-3.5 font-mono text-[11px] text-on-surface-variant">
        {user.created_at ? new Date(user.created_at).toLocaleDateString('ar-EG') : '—'}
      </td>

      <td className="p-3.5 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => onEditRole(user)}
            title="تعديل الرتبة والصلاحيات"
            className="p-1.5 rounded-lg bg-surface-container-high hover:text-primary transition-colors text-on-surface-variant inline-flex items-center"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onToggleStatus(user)}
            title={isSuspended ? 'إلغاء التجميد وتفعيل الحساب' : 'تجميد الحساب'}
            className={`p-1.5 rounded-lg bg-surface-container-high transition-colors inline-flex items-center ${
              isSuspended
                ? 'hover:text-primary text-error'
                : 'hover:text-error text-on-surface-variant'
            }`}
          >
            {isSuspended ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => onDelete(user)}
            title="حذف الحساب نهائياً"
            className="p-1.5 rounded-lg bg-surface-container-high hover:text-error transition-colors text-on-surface-variant inline-flex items-center"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default UserCardItem;
