'use client';

/**
 * رتل - Ratil
 * نافذة تعديل رتبة وصلاحيات وحالة المستخدم
 * features/admin/components/EditUserRoleModal.tsx
 */

import React, { useState } from 'react';
import { X, Shield, Check, Loader2, UserCheck, AlertTriangle } from 'lucide-react';
import type { AdminUserItem } from '../types/admin.types';

export interface EditUserRoleModalProps {
  isOpen: boolean;
  user: AdminUserItem | null;
  onClose: () => void;
  onSave: (userId: string, data: { role: 'admin' | 'moderator' | 'user'; status: 'active' | 'suspended' }) => Promise<void> | void;
}

export function EditUserRoleModal({
  isOpen,
  user,
  onClose,
  onSave,
}: EditUserRoleModalProps) {
  const [role, setRole] = useState<'admin' | 'moderator' | 'user'>(user?.role || 'user');
  const [status, setStatus] = useState<'active' | 'suspended'>(user?.status || 'active');
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (user) {
      setRole(user.role || 'user');
      setStatus(user.status || 'active');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(user.id, { role, status });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-surface-container border border-surface-container-high rounded-3xl max-w-md w-full p-6 flex flex-col gap-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">تعديل رتبة وصلاحيات الحساب</h3>
              <p className="text-[11px] text-on-surface-variant truncate max-w-[240px]">{user.name} ({user.email})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          <div>
            <label className="text-on-surface-variant block mb-1 font-bold">رتبة وصلاحية المستخدم:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest"
            >
              <option value="user">مستخدم عادي (قارئ ومستمع)</option>
              <option value="moderator">مشرف محتوى (مراجعة البلاغات وتحديث الروابط)</option>
              <option value="admin">مدير نظام كامل (كافة الصلاحيات والحوكمة)</option>
            </select>
          </div>

          <div>
            <label className="text-on-surface-variant block mb-1 font-bold">حالة الحساب:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest"
            >
              <option value="active">نشط ومفعل (Active)</option>
              <option value="suspended">مجمد / محظور (Suspended)</option>
            </select>
            {status === 'suspended' && (
              <span className="text-[11px] text-error flex items-center gap-1 mt-1 font-sans">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>لن يتمكن المستخدم من تسجيل الدخول طالما الحساب مجمد.</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-high">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-on-surface"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserRoleModal;
