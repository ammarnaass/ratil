/**
 * رتل - Ratil
 * تعريفات أنواع لوحة الإدارة
 * components/admin/types.ts
 */

import type { Reciter, Report } from '@/lib/types';

export type TabType = 'reciters' | 'audio' | 'reports' | 'health';

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
