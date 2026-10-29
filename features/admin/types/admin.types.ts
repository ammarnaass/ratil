/**
 * رتل - Ratil
 * أنواع بيانات لوحة إدارة وحوكمة النظام
 * features/admin/types/admin.types.ts
 */

export type AdminTab = 'integrity' | 'reciters' | 'audio' | 'health' | 'reports';

export interface AdminReciter {
  id: string;
  name: string;
  riwaya: 'hafs' | 'warsh' | 'qalon' | string;
  license: 'public-domain' | 'cc-by' | 'permission' | string;
  source_name: string;
  source_url?: string;
  is_visible: boolean;
  notes?: string;
  surah_count?: number;
  created_at?: string;
}

export interface AdminSurahAudio {
  id?: number;
  reciter_id: string;
  surah_number: number;
  audio_url: string;
  timings_url?: string;
  duration_seconds?: number;
  size_mb?: number;
  verified: boolean;
  reciter_name?: string;
}

export interface AdminReport {
  id: number;
  type: 'text' | 'audio' | 'request' | string;
  surah_number?: number;
  ayah_number?: number;
  reciter_id?: string;
  description: string;
  status: 'new' | 'reviewed' | 'closed' | string;
  admin_notes?: string;
  created_at: string;
}

export interface HealthCheckResult {
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

export interface IntegrityDetails {
  authority: string;
  total_ayahs?: number;
  expected: string;
  actual: string;
  matched: boolean;
}

export interface IntegrityCheckResponse {
  status: 'verified' | 'mismatch' | 'error';
  timestamp: string;
  details: {
    hafs: IntegrityDetails;
    warsh: IntegrityDetails;
    font_hafs: IntegrityDetails;
    font_warsh: IntegrityDetails;
  };
}
