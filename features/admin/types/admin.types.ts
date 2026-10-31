/**
 * رتل - Ratil
 * تعريفات أنواع لوحة الإدارة والحوكمة المركزية
 * features/admin/types/admin.types.ts
 */

import type { Reciter, Report } from '@/lib/types';

export type TabType = 'reciters' | 'audio' | 'users' | 'analytics' | 'audit' | 'reports' | 'health';

export interface HealthCheckData {
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

export interface ReciterFormData {
  id: string;
  name: string;
  riwaya: string;
  license: string;
  source_name: string;
  source_url: string;
  notes: string;
}

export interface AudioFormData {
  reciter_id: string;
  surah_number: number;
  audio_url: string;
}

export type ReportFilter = 'all' | 'new' | 'reviewed' | 'closed';

export interface StatusMessage {
  text: string;
  isError?: boolean;
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  status: 'active' | 'suspended';
  avatar?: string | null;
  last_login_at?: string | null;
  login_count: number;
  created_at: string;
}

export interface AnalyticsOverview {
  totalPlays: number;
  totalDownloads: number;
  bandwidthMb: number;
  completionRate: number;
  todayPlays: number;
  todayDownloads: number;
  topSurahs: Array<{
    surahNumber: number;
    surahName: string;
    plays: number;
    downloads: number;
  }>;
  topReciters: Array<{
    reciterId: string;
    reciterName: string;
    plays: number;
    downloads: number;
  }>;
  trends: Array<{
    date: string;
    plays: number;
    downloads: number;
  }>;
}

export interface AuditLogItem {
  id: number;
  admin_id: string;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: string;
  details?: any;
  created_at: string;
}
