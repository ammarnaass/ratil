/**
 * رتل - Ratil
 * تعريفات الأنواع والكيانات (TypeScript Types)
 * lib/types.ts
 */

export interface Reciter {
  id: string;
  name: string;
  riwaya: 'hafs' | 'warsh' | 'qalon' | string;
  license: 'public-domain' | 'cc-by' | 'permission' | string;
  source_name: string;
  source_url?: string | null;
  license_url?: string | null;
  is_visible?: boolean;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  surah_count?: number;
  surahs?: SurahAudio[];
}

export interface SurahAudio {
  id?: number;
  reciter_id: string;
  surah_number: number;
  audio_url: string;
  timings_url?: string | null;
  duration_seconds?: number | null;
  size_mb?: number | null;
  verified?: boolean;
  reciter_name?: string;
  riwaya?: string;
  created_at?: string;
}

export interface Surah {
  id: number;
  ar: string;
  name_ar?: string;
  en: string;
  name_en?: string;
  type: string;
  ayahs: number;
  ayahs_hafs?: number;
  ayahs_warsh?: number;
  page?: number;
}

export interface Ayah {
  number: number;
  text: string;
}

export interface SurahDetail extends Surah {
  verses: Ayah[];
}

export interface Report {
  id?: number;
  type: 'text' | 'audio' | 'request';
  surah_number?: number | null;
  ayah_number?: number | null;
  reciter_id?: string | null;
  description: string;
  status?: 'new' | 'reviewed' | 'closed';
  admin_notes?: string | null;
  created_at?: string;
}

export interface HealthLog {
  id?: number;
  reciter_id: string;
  audio_url: string;
  http_status: number;
  supports_range: boolean;
  response_ms: number;
  error_msg?: string | null;
  checked_at?: string;
}

export interface Bookmark {
  surahId: number;
  ayahNumber: number;
  surahName: string;
  reciterId?: string;
  reciterName?: string;
  timestamp: number;
}

export interface PlaybackState {
  surahId: number;
  ayahNumber: number;
  reciterId: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}
