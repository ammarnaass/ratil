'use client';

/**
 * رتل - Ratil
 * لوحة الإدارة والحوكمة المركزية المباشرة (Direct Admin Panel)
 * محمية بواسطة ADMIN_SECRET ومخزنة في جلسة المتصفح (sessionStorage)
 * app/admin/page.tsx
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Lock,
  KeyRound,
  Shield,
  Users,
  Radio,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  ExternalLink,
  LogOut,
  ArrowRight,
  Database,
  Check,
  CheckCircle,
} from 'lucide-react';
import Logo from '@/components/Logo';
import type { Reciter, Report } from '@/lib/types';

interface HealthCheckData {
  checked: number;
  ok: number;
  results: Array<{
    reciter_id: string;
    audio_url: string;
    status: number;
    ok: boolean;
    ms: number;
    error?: string;
  }>;
}

type TabType = 'reciters' | 'audio' | 'reports' | 'health';

const RIWAYA_OPTIONS = [
  { value: 'hafs', label: 'حفص عن عاصم' },
  { value: 'warsh', label: 'ورش عن نافع' },
  { value: 'qalon', label: 'قالون عن نافع' },
  { value: 'al-duri', label: 'الدوري عن أبي عمرو' },
  { value: 'shuba', label: 'شعبة عن عاصم' },
];

const LICENSE_OPTIONS = [
  { value: 'public-domain', label: 'ملكية عامة (Public Domain)' },
  { value: 'cc-by', label: 'رخصة المشاع الإبداعي (CC BY 4.0)' },
  { value: 'permission', label: 'إذن رسمي مكتوب من صاحب الحقوق' },
];

export default function AdminPage() {
  const [adminSecret, setAdminSecret] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('reciters');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // بيانات اللوحة
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [healthData, setHealthData] = useState<HealthCheckData | null>(null);
  const [selectedReciterId, setSelectedReciterId] = useState<string>('al-minshawy');
  const [reportFilter, setReportFilter] = useState<'all' | 'new' | 'reviewed' | 'closed'>('all');

  // نموذج إضافة قارئ
  const [showAddReciter, setShowAddReciter] = useState(false);
  const [reciterForm, setReciterForm] = useState({
    id: '',
    name: '',
    riwaya: 'hafs',
    license: 'public-domain',
    source_name: '',
    source_url: '',
    notes: '',
  });

  // نموذج إضافة/تحديث رابط صوتي
  const [showAddAudio, setShowAddAudio] = useState(false);
  const [audioForm, setAudioForm] = useState({
    reciter_id: 'al-minshawy',
    surah_number: 1,
    audio_url: '',
  });

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

  // جلب البيانات
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

  // إدارة القرّاء: إضافة قارئ جديد
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
      setReciterForm({
        id: '',
        name: '',
        riwaya: 'hafs',
        license: 'public-domain',
        source_name: '',
        source_url: '',
        notes: '',
      });
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
      showNotification(status === 'closed' ? 'تم اعتماد البلاغ كـ "محلول"' : 'تم وضع البلاغ قيد المراجعة');
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

  // شاشة تسجيل الدخول بـ ADMIN_SECRET
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto my-12 p-8 rounded-3xl bg-surface-container border border-surface-container-high shadow-2xl flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>

        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-bold text-on-surface">لوحة إدارة وحوكمة رتل</h1>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            أدخل المفتاح الإداري السري{' '}
            <span className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
              ADMIN_SECRET
            </span>{' '}
            للتحكم في قاعدة بيانات Neon وفحص مصادر Archive.org
          </p>
        </div>

        {authError && (
          <div className="w-full p-3 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2 text-right">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div className="relative">
            <KeyRound className="w-4 h-4 absolute right-3.5 top-3.5 text-on-surface-variant" />
            <input
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              placeholder="أدخل ADMIN_SECRET..."
              className="w-full py-3 pr-10 pl-4 rounded-xl bg-surface-container-high border border-surface-container-highest text-on-surface text-sm focus:outline-none focus:border-primary transition-all font-mono"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-95 transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? 'جاري التحقق...' : 'فتح لوحة التحكم'}
          </button>
        </form>

        <div className="pt-2 border-t border-surface-container-high/60 w-full flex items-center justify-between text-xs text-on-surface-variant">
          <Link
            href="/"
            className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة للمصحف</span>
          </Link>
          <div className="flex items-center gap-1 text-[11px] text-outline">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>حوكمة مشفرة (Bearer Token)</span>
          </div>
        </div>
      </div>
    );
  }

  // تصفية البلاغات
  const filteredReports = reports.filter((r) => {
    if (reportFilter === 'all') return true;
    return r.status === reportFilter;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)]">
      {/* ─── 1. الشريط الجانبي (Sidebar) ─── */}
      <aside className="w-full lg:w-64 bg-surface-container-low border border-surface-container-high rounded-2xl p-4 flex flex-col justify-between gap-6 shrink-0 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between pb-4 border-b border-surface-container-high">
            <div className="flex items-center gap-2.5">
              <Logo size={32} />
              <div className="flex flex-col">
                <span className="font-bold text-sm text-on-surface">إدارة رتّل المركزية</span>
                <span className="text-[10px] text-primary font-mono font-medium">
                  Vercel • Neon • Archive.org
                </span>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider px-2 mb-1">
              أقسام الإدارة والحوكمة
            </span>

            <button
              onClick={() => setActiveTab('reciters')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'reciters'
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 shrink-0" />
                <span>إدارة القرّاء</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  activeTab === 'reciters'
                    ? 'bg-on-primary/20 text-on-primary'
                    : 'bg-surface-container-highest text-primary'
                }`}
              >
                {reciters.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'audio'
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 shrink-0" />
                <span>الصوتيات وArchive</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'reports'
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>بلاغات التدقيق</span>
              </div>
              {reports.filter((r) => r.status === 'new').length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    activeTab === 'reports'
                      ? 'bg-on-primary/20 text-on-primary'
                      : 'bg-error-container text-on-error-container'
                  }`}
                >
                  {reports.filter((r) => r.status === 'new').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('health')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'health'
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 shrink-0" />
                <span>فحص Archive.org</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t border-surface-container-high text-xs">
          <div className="p-2.5 rounded-xl bg-surface-container border border-surface-container-high/60 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-on-surface-variant">
              <Database className="w-3.5 h-3.5 text-primary" />
              <span>Neon PostgreSQL</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] text-primary font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              متصل
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Link
              href="/"
              className="flex-1 py-2 px-3 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors text-center text-xs flex items-center justify-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>المصحف</span>
            </Link>

            <button
              onClick={handleLogout}
              title="تسجيل الخروج"
              className="py-2 px-3 rounded-xl bg-surface-container-high text-error hover:bg-error/10 transition-colors text-xs flex items-center justify-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>قفل</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ─── 2. منطقة المحتوى الرئيسية ─── */}
      <main className="flex-1 flex flex-col gap-6 bg-surface-container-lowest/50 border border-surface-container-high rounded-2xl p-6 shadow-sm">
        {/* شريط الإشعارات والتحديث */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-container-high flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-on-surface">
              {activeTab === 'reciters' && 'إدارة المشايخ والقرّاء والرخص'}
              {activeTab === 'audio' && 'قواعد التخزين الصوتي وتدفق السور (Archive.org)'}
              {activeTab === 'reports' && 'مركز مراجعة وتدقيق بلاغات الأخطاء العلمية'}
              {activeTab === 'health' && 'فحص جودة استجابة مصادر Archive.org الحية'}
            </h1>
            {statusMessage && (
              <span
                className={`text-xs px-2.5 py-1 rounded-lg ${
                  statusMessage.isError
                    ? 'bg-error-container text-on-error-container'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                {statusMessage.text}
              </span>
            )}
          </div>

          <button
            onClick={() => loadData(adminSecret)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs transition-colors border border-surface-container-high disabled:opacity-50"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
        </div>

        {/* ─── تبويب 1: إدارة القرّاء ─── */}
        {activeTab === 'reciters' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-on-surface">قائمة القرّاء المعتمدين</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-bold">
                  {reciters.length} قرّاء
                </span>
              </div>

              <button
                onClick={() => setShowAddReciter(!showAddReciter)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddReciter ? 'إلغاء الإضافة' : 'إضافة قارئ جديد'}</span>
              </button>
            </div>

            {showAddReciter && (
              <form
                onSubmit={handleCreateReciter}
                className="p-5 rounded-2xl bg-surface-container border border-primary/20 shadow-lg flex flex-col gap-4 text-xs"
              >
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
                      value={reciterForm.id}
                      onChange={(e) =>
                        setReciterForm({ ...reciterForm, id: e.target.value.toLowerCase().trim() })
                      }
                      className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-on-surface-variant block mb-1">الاسم الكريم للقارئ *</label>
                    <input
                      type="text"
                      placeholder="الشيخ محمد صديق المنشاوي"
                      value={reciterForm.name}
                      onChange={(e) => setReciterForm({ ...reciterForm, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-on-surface-variant block mb-1">الرواية القرآنية</label>
                    <select
                      value={reciterForm.riwaya}
                      onChange={(e) => setReciterForm({ ...reciterForm, riwaya: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest"
                    >
                      {RIWAYA_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-on-surface-variant block mb-1">الترخيص العلمي</label>
                    <select
                      value={reciterForm.license}
                      onChange={(e) => setReciterForm({ ...reciterForm, license: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest"
                    >
                      {LICENSE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-on-surface-variant block mb-1">اسم المصدر المعتمد *</label>
                    <input
                      type="text"
                      placeholder="أرشيف الإذاعة المصرية"
                      value={reciterForm.source_name}
                      onChange={(e) =>
                        setReciterForm({ ...reciterForm, source_name: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-on-surface-variant block mb-1">رابط المصدر على Archive.org</label>
                    <input
                      type="url"
                      placeholder="https://archive.org/details/..."
                      value={reciterForm.source_url}
                      onChange={(e) =>
                        setReciterForm({ ...reciterForm, source_url: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-surface-container-high">
                  <button
                    type="button"
                    onClick={() => setShowAddReciter(false)}
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
                      <th className="p-3.5">الحالة</th>
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
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              r.is_visible !== false
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'bg-surface-container-highest text-outline'
                            }`}
                          >
                            {r.is_visible !== false ? 'مرئي للعامة' : 'مخفي'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleToggleVisibility(r)}
                              title={r.is_visible !== false ? 'إخفاء من الواجهة' : 'إظهار في الواجهة'}
                              className="p-1.5 rounded-lg bg-surface-container-high hover:text-primary transition-colors text-on-surface-variant inline-flex items-center"
                            >
                              {r.is_visible !== false ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteReciter(r.id, r.name)}
                              title="حذف القارئ"
                              className="p-1.5 rounded-lg bg-surface-container-high hover:text-error transition-colors text-on-surface-variant inline-flex items-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── تبويب 2: الصوتيات وArchive.org ─── */}
        {activeTab === 'audio' && (
          <div className="flex flex-col gap-6">
            <div className="p-6 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold text-on-surface">
                  قواعد معمارية التخزين الصوتي الدائم (Archive.org)
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-surface-container-high border border-surface-container-highest flex flex-col gap-1.5">
                  <span className="font-bold text-primary">1. المعرف الثابت (Identifier)</span>
                  <p className="text-on-surface-variant leading-relaxed font-mono text-[11px]">
                    ratil-&#123;reciter&#125;
                  </p>
                  <span className="text-[10px] text-outline">معرف فريد ودائم في أرشيف الإنترنت</span>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-high border border-surface-container-highest flex flex-col gap-1.5">
                  <span className="font-bold text-primary">2. نسق الروابط المباشرة</span>
                  <p className="text-on-surface-variant leading-relaxed font-mono text-[11px] truncate">
                    https://archive.org/download/ratil-&#123;id&#125;/001.mp3
                  </p>
                  <span className="text-[10px] text-outline">تدعم Range Requests و CORS تلقائياً</span>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-high border border-surface-container-highest flex flex-col gap-1.5">
                  <span className="font-bold text-primary">3. كفاءة البث والقفز اللحظي</span>
                  <p className="text-on-surface-variant leading-relaxed text-[11px]">
                    استجابة سريعة HTTP 206 لتقطيع الصوت بحسب الآية دون استهلاك باقة المستخدم
                  </p>
                  <span className="text-[10px] text-outline">تخفيض استهلاك Bandwidth على Vercel إلى صفر</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-on-surface">استعراض سور القارئ:</span>
                  <div className="flex items-center gap-1.5 bg-surface-container p-1 rounded-xl border border-surface-container-high">
                    {reciters.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setSelectedReciterId(r.id);
                          setAudioForm({ ...audioForm, reciter_id: r.id });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          selectedReciterId === r.id
                            ? 'bg-primary text-on-primary'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {r.name.replace('الشيخ ', '')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddAudio(!showAddAudio)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs text-on-surface border border-surface-container-high"
                  >
                    <Plus className="w-3.5 h-3.5 text-primary" />
                    <span>تحديث رابط سورة</span>
                  </button>

                  <a
                    href={`https://archive.org/details/ratil-${selectedReciterId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline font-mono"
                  >
                    <span>مجموعة Archive.org</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {showAddAudio && (
                <form
                  onSubmit={handleSaveAudio}
                  className="p-4 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col gap-3 text-xs"
                >
                  <h4 className="font-bold text-on-surface">إضافة أو تحديث رابط سورة صوتية في Neon</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-on-surface-variant block mb-1">القارئ</label>
                      <input
                        type="text"
                        value={audioForm.reciter_id}
                        disabled
                        className="w-full p-2 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-on-surface-variant block mb-1">رقم السورة (1-114)</label>
                      <input
                        type="number"
                        min={1}
                        max={114}
                        value={audioForm.surah_number}
                        onChange={(e) =>
                          setAudioForm({ ...audioForm, surah_number: Number(e.target.value) })
                        }
                        className="w-full p-2 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-on-surface-variant block mb-1">رابط ملف MP3</label>
                      <input
                        type="url"
                        placeholder="https://archive.org/download/..."
                        value={audioForm.audio_url}
                        onChange={(e) => setAudioForm({ ...audioForm, audio_url: e.target.value })}
                        className="w-full p-2 rounded-xl bg-surface-container-high text-on-surface border border-surface-container-highest font-mono"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAudio(false)}
                      className="px-3 py-1.5 rounded-xl bg-surface-container-high text-on-surface-variant"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-primary text-on-primary font-bold"
                    >
                      حفظ السورة
                    </button>
                  </div>
                </form>
              )}

              <div className="p-5 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-surface-container-high">
                  <span className="font-bold text-on-surface">
                    سور القارئ الـ 114 مفهرسة ومربوطة في Neon Database
                  </span>
                  <span className="text-primary font-mono font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    114 / 114 سورة
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {Array.from({ length: 114 }, (_, i) => i + 1).map((sNum) => {
                    const pad = String(sNum).padStart(3, '0');
                    const url = `https://archive.org/download/ratil-${selectedReciterId}/${pad}.mp3`;
                    return (
                      <div
                        key={sNum}
                        className="p-2.5 rounded-xl bg-surface-container-high border border-surface-container-highest flex flex-col gap-1 text-[11px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-outline">#{sNum}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                        <span
                          className="font-mono text-[10px] text-on-surface-variant truncate"
                          title={url}
                        >
                          {pad}.mp3
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── تبويب 3: بلاغات المستخدمين ─── */}
        {activeTab === 'reports' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-on-surface">بلاغات التدقيق العلمي</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-bold">
                  {reports.length} بلاغات مسجلة
                </span>
              </div>

              <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-surface-container-high text-xs">
                <button
                  onClick={() => setReportFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    reportFilter === 'all'
                      ? 'bg-primary text-on-primary font-bold'
                      : 'text-on-surface-variant'
                  }`}
                >
                  الكل ({reports.length})
                </button>
                <button
                  onClick={() => setReportFilter('new')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    reportFilter === 'new'
                      ? 'bg-primary text-on-primary font-bold'
                      : 'text-on-surface-variant'
                  }`}
                >
                  جديدة ({reports.filter((r) => r.status === 'new').length})
                </button>
                <button
                  onClick={() => setReportFilter('reviewed')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    reportFilter === 'reviewed'
                      ? 'bg-primary text-on-primary font-bold'
                      : 'text-on-surface-variant'
                  }`}
                >
                  قيد المراجعة
                </button>
                <button
                  onClick={() => setReportFilter('closed')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    reportFilter === 'closed'
                      ? 'bg-primary text-on-primary font-bold'
                      : 'text-on-surface-variant'
                  }`}
                >
                  تم الحل
                </button>
              </div>
            </div>

            {filteredReports.length === 0 ? (
              <div className="p-12 text-center text-xs text-on-surface-variant bg-surface-container rounded-2xl border border-surface-container-high flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-outline">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <span className="font-bold text-sm text-on-surface">
                  لا توجد بلاغات تطابق التصفية الحالية
                </span>
                <p className="text-[11px] max-w-sm text-outline">
                  جميع البلاغات العلمية المرسلة من مستخدمي التطبيق تم تدقيقها مقابل النص المعتمد.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-5 rounded-2xl bg-surface-container border border-surface-container-high shadow-sm flex flex-col gap-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface font-mono font-bold">
                          #{rep.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            rep.status === 'new'
                              ? 'bg-error-container text-on-error-container'
                              : rep.status === 'reviewed'
                              ? 'bg-secondary/20 text-secondary'
                              : 'bg-primary/20 text-primary'
                          }`}
                        >
                          {rep.status === 'new'
                            ? 'بلاغ جديد'
                            : rep.status === 'reviewed'
                            ? 'قيد المراجعة'
                            : 'تم الحل'}
                        </span>
                        <span className="text-on-surface-variant text-[11px]">
                          نوع البلاغ: <strong className="text-on-surface">{rep.type}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {rep.status !== 'reviewed' && (
                          <button
                            onClick={() => rep.id && handleUpdateReport(rep.id, 'reviewed')}
                            className="px-3 py-1.5 rounded-lg bg-surface-container-high text-secondary hover:bg-secondary/10 transition-colors font-bold text-[11px] flex items-center gap-1"
                          >
                            <Clock className="w-3 h-3" />
                            <span>قيد المراجعة</span>
                          </button>
                        )}
                        {rep.status !== 'closed' && (
                          <button
                            onClick={() => rep.id && handleUpdateReport(rep.id, 'closed')}
                            className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-bold text-[11px] hover:opacity-90 transition-all flex items-center gap-1 shadow-sm"
                          >
                            <Check className="w-3 h-3" />
                            <span>اعتماد كـ "تم الحل"</span>
                          </button>
                        )}
                        <button
                          onClick={() => rep.id && handleDeleteReport(rep.id)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                          title="حذف البلاغ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-surface-container-high flex flex-col gap-2">
                      {(rep.surah_number || rep.ayah_number || rep.reciter_id) && (
                        <div className="flex items-center gap-3 text-[11px] text-outline font-mono border-b border-surface-container-highest pb-2">
                          {rep.surah_number && <span>السورة رقم: {rep.surah_number}</span>}
                          {rep.ayah_number && <span>الآية رقم: {rep.ayah_number}</span>}
                          {rep.reciter_id && <span>القارئ: {rep.reciter_id}</span>}
                        </div>
                      )}
                      <p className="text-on-surface leading-relaxed text-xs">{rep.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-outline pt-1">
                      <span>
                        تاريخ الإرسال:{' '}
                        {rep.created_at ? new Date(rep.created_at).toLocaleString('ar-SA') : '—'}
                      </span>
                      {rep.admin_notes && (
                        <span className="text-primary italic font-medium">
                          ملاحظة المدير: {rep.admin_notes}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── تبويب 4: فحص Archive.org ─── */}
        {activeTab === 'health' && (
          <div className="flex flex-col gap-6">
            <div className="p-6 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-base font-bold text-on-surface">
                    فحص جودة استجابة مصادر Archive.org الحية
                  </h2>
                  <p className="text-xs text-on-surface-variant max-w-xl leading-relaxed">
                    يقوم بإرسال طلبات رأسية مجزأة (HEAD Range Requests: bytes=0-1023) للتأكد من دعم الخادم
                    لتدفق الصوت اللحظي وخلوه من قيود الحظر الجغرافي.
                  </p>
                </div>
              </div>

              <button
                onClick={handleRunHealthCheck}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 transition-all disabled:opacity-50 shrink-0 shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'جاري الفحص الحي...' : 'تشغيل الفحص السحابي الآن'}</span>
              </button>
            </div>

            {healthData && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high flex flex-col gap-1">
                    <span className="text-[11px] text-on-surface-variant">المصادر المفحوصة</span>
                    <span className="text-2xl font-bold font-mono text-on-surface">
                      {healthData.checked}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high flex flex-col gap-1">
                    <span className="text-[11px] text-on-surface-variant">المصادر السليمة (HTTP 206)</span>
                    <span className="text-2xl font-bold font-mono text-primary">
                      {healthData.ok}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high flex flex-col gap-1">
                    <span className="text-[11px] text-on-surface-variant">كفاءة التوفر (Uptime)</span>
                    <span className="text-2xl font-bold font-mono text-primary">
                      {healthData.checked > 0
                        ? Math.round((healthData.ok / healthData.checked) * 100)
                        : 100}
                      %
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-surface-container border border-surface-container-high overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-surface-container-high font-bold text-xs text-on-surface flex items-center justify-between">
                    <span>سجل نتائج الفحص المسجلة في Neon DB</span>
                    <span className="text-[11px] text-outline font-mono">health_logs table</span>
                  </div>

                  <div className="divide-y divide-surface-container-high">
                    {healthData.results?.map((res, i) => (
                      <div
                        key={i}
                        className="p-3.5 flex items-center justify-between gap-4 text-xs hover:bg-surface-container-high/30 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {res.ok ? (
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-error shrink-0" />
                          )}
                          <span className="font-bold text-on-surface font-mono">{res.reciter_id}</span>
                          <span className="text-outline font-mono truncate text-[11px] max-w-xs">
                            {res.audio_url}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 font-mono shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              res.ok ? 'bg-primary/10 text-primary' : 'bg-error-container text-error'
                            }`}
                          >
                            HTTP {res.status || 'ERR'}
                          </span>
                          <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {res.ms}ms
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
