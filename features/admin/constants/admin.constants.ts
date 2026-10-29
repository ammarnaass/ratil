/**
 * رتل - Ratil
 * ثوابت وإعدادات لوحة الإدارة
 * features/admin/constants/admin.constants.ts
 */

export const ADMIN_AUTH_STORAGE_KEY = 'ratil_admin_secret_token';

export const ADMIN_TABS = [
  { id: 'integrity', label: 'سلامة النص القرآني', screenNumber: 11, icon: 'ShieldCheck' },
  { id: 'reciters', label: 'المشايخ والقرّاء', screenNumber: 12, icon: 'Users' },
  { id: 'audio', label: 'التلاوات وروابط الصوت', screenNumber: 13, icon: 'Radio' },
  { id: 'health', label: 'المراقبة وفحص الخوادم', screenNumber: 14, icon: 'Activity' },
  { id: 'reports', label: 'مركز تدقيق البلاغات', screenNumber: 15, icon: 'AlertCircle' },
] as const;

export const RIWAYA_OPTIONS = [
  { value: 'hafs', label: 'حفص عن عاصم (الكوفي)' },
  { value: 'warsh', label: 'ورش عن نافع (طريق الأزرق)' },
  { value: 'qalon', label: 'قالون عن نافع (المدني)' },
] as const;

export const LICENSE_OPTIONS = [
  { value: 'public-domain', label: 'الملك العام (Public Domain)' },
  { value: 'cc-by', label: 'مشاع إبداعي مع الإسناد (CC-BY)' },
  { value: 'permission', label: 'إذن رسمي موثق' },
] as const;
