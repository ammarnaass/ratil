/**
 * رتل - Ratil
 * الشاشة 12: إدارة المشايخ والقرّاء وتراخيصهم في Neon DB
 * features/admin/components/RecitersManagementTab.tsx
 */

import React, { useState } from 'react';
import { Plus, Eye, EyeOff, Radio, ExternalLink, ShieldCheck } from 'lucide-react';
import type { AdminReciter } from '../types/admin.types';
import { RIWAYA_OPTIONS, LICENSE_OPTIONS } from '../constants/admin.constants';

interface RecitersManagementTabProps {
  reciters: AdminReciter[];
  onCreateReciter: (data: Partial<AdminReciter>) => Promise<void>;
  onToggleVisibility: (reciter: AdminReciter) => Promise<void>;
}

export function RecitersManagementTab({
  reciters,
  onCreateReciter,
  onToggleVisibility,
}: RecitersManagementTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<AdminReciter>>({
    id: '',
    name: '',
    riwaya: 'hafs',
    license: 'public-domain',
    source_name: '',
    source_url: '',
    notes: '',
    is_visible: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.source_name) return;
    await onCreateReciter(formData);
    setFormData({
      id: '',
      name: '',
      riwaya: 'hafs',
      license: 'public-domain',
      source_name: '',
      source_url: '',
      notes: '',
      is_visible: true,
    });
    setShowAddForm(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* شريط الإجراءات والبحث */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-on-surface">قائمة القرّاء والمشايخ</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-bold">
            {reciters.length} قرّاء
          </span>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'إلغاء الإضافة' : 'إضافة قارئ جديد'}</span>
        </button>
      </div>

      {/* نموذج إضافة قارئ جديد */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-surface-container border border-primary/20 shadow-lg flex flex-col gap-4 text-xs">
          <h3 className="font-bold text-sm text-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>بيانات القارئ الجديد (Neon PostgreSQL)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-on-surface-variant block mb-1">المعرف الفريد (ID) *</label>
              <input
                type="text"
                placeholder="al-minshawy"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().trim() })}
                className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest font-mono"
                required
              />
            </div>

            <div>
              <label className="text-on-surface-variant block mb-1">الاسم الكريم للقارئ *</label>
              <input
                type="text"
                placeholder="الشيخ محمد صديق المنشاوي"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest"
                required
              />
            </div>

            <div>
              <label className="text-on-surface-variant block mb-1">الرواية القرآنية</label>
              <select
                value={formData.riwaya}
                onChange={(e) => setFormData({ ...formData, riwaya: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest"
              >
                {RIWAYA_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-on-surface-variant block mb-1">الترخيص العلمي</label>
              <select
                value={formData.license}
                onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest"
              >
                {LICENSE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-on-surface-variant block mb-1">اسم المصدر المعتمد *</label>
              <input
                type="text"
                placeholder="أرشيف الإذاعة المصرية"
                value={formData.source_name}
                onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest"
                required
              />
            </div>

            <div>
              <label className="text-on-surface-variant block mb-1">رابط المصدر على Archive.org</label>
              <input
                type="url"
                placeholder="https://archive.org/details/..."
                value={formData.source_url}
                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-container-high">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-on-surface"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 transition-all shadow-sm"
            >
              حفظ القارئ في Neon
            </button>
          </div>
        </form>
      )}

      {/* جدول القرّاء */}
      <div className="rounded-2xl bg-surface-container border border-surface-container-high overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-surface-container-high text-on-surface-variant border-b border-surface-container-highest">
              <tr>
                <th className="p-3.5">المعرف</th>
                <th className="p-3.5">القارئ الشيخ</th>
                <th className="p-3.5">الرواية</th>
                <th className="p-3.5">الترخيص والمصدر</th>
                <th className="p-3.5">السور المتاحة</th>
                <th className="p-3.5">الحالة في التطبيق</th>
                <th className="p-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {reciters.map((r) => (
                <tr key={r.id} className="hover:bg-surface-container-high/40 transition-colors">
                  <td className="p-3.5 font-mono text-primary font-semibold">{r.id}</td>
                  <td className="p-3.5 font-bold text-on-surface">{r.name}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-surface-container-highest text-on-surface font-mono">
                      {r.riwaya === 'hafs' ? 'حفص' : r.riwaya === 'warsh' ? 'ورش' : r.riwaya}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-on-surface font-medium">{r.source_name}</span>
                      <span className="text-[10px] text-outline">{r.license}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-primary font-bold">
                    {r.surah_count || 114} / 114
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                      r.is_visible !== false
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'bg-surface-container-highest text-outline'
                    }`}>
                      {r.is_visible !== false ? 'مرئي للعامة' : 'مخفي مؤقتاً'}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => onToggleVisibility(r)}
                      title={r.is_visible !== false ? 'إخفاء من الواجهة' : 'إظهار في الواجهة'}
                      className="p-1.5 rounded-lg bg-surface-container-high hover:text-primary transition-colors text-on-surface-variant inline-flex items-center"
                    >
                      {r.is_visible !== false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
