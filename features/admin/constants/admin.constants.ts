/**
 * رتل - Ratil
 * ثوابت وإعدادات لوحة الإدارة
 * features/admin/constants/admin.constants.ts
 */

export const ADMIN_SECRET_STORAGE_KEY = 'ratil_admin_secret';

export const RIWAYA_OPTIONS = [
  { value: 'hafs', label: 'حفص عن عاصم' },
  { value: 'warsh', label: 'ورش عن نافع' },
  { value: 'qalon', label: 'قالون عن نافع' },
  { value: 'al-duri', label: 'الدوري عن أبي عمرو' },
  { value: 'shuba', label: 'شعبة عن عاصم' },
];

export const LICENSE_OPTIONS = [
  { value: 'public-domain', label: 'ملكية عامة (Public Domain)' },
  { value: 'cc-by', label: 'رخصة المشاع الإبداعي (CC BY 4.0)' },
  { value: 'permission', label: 'إذن رسمي مكتوب من صاحب الحقوق' },
];

export const INITIAL_RECITER_FORM = {
  id: '',
  name: '',
  riwaya: 'hafs',
  license: 'public-domain',
  source_name: '',
  source_url: '',
  notes: '',
};

export const INITIAL_AUDIO_FORM = {
  reciter_id: 'al-minshawy',
  surah_number: 1,
  audio_url: '',
};
