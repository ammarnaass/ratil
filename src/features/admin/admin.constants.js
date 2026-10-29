/**
 * ثوابت وإعدادات لوحة التحكم والحوكمة المركزية
 * src/features/admin/admin.constants.js
 */

export const ADMIN_TABS = {
  OVERVIEW: 'overview',
  RECITERS: 'reciters',
  AUDIO_FILES: 'audio-files',
  TEXT_INTEGRITY: 'text-integrity',
  REPORTS: 'reports',
  ANALYTICS: 'analytics',
  LICENSES: 'licenses',
  SETTINGS: 'settings'
};

export const SYSTEM_STATUS = {
  OPERATIONAL: 'operational',
  DEGRADED: 'degraded',
  MAINTENANCE: 'maintenance'
};

export const AUDIT_METRICS = {
  TOTAL_SURAHS: 114,
  TOTAL_AYAS_HAFS: 6236,
  TOTAL_AYAS_WARSH: 6214,
  PRIMARY_AUDIO_TIER: 'cdn.ratil.app',
  FALLBACK_AUDIO_TIER: 'archive.org',
  RELIABILITY_PERCENT: 100
};
