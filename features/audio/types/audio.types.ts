/**
 * رتل - Ratil
 * تعريفات وأنواع معالجة الصوتيات و Archive.org
 * features/audio/types/audio.types.ts
 */

export interface ParsedArchiveAudio {
  rawInput: string;
  itemId: string;
  fileName: string;
  surahNumber: number | null;
  downloadUrl: string;
  embedUrl: string;
  detailsUrl: string;
  embedIframe: string;
  embedTag: string;
  isValid: boolean;
  error?: string;
}

export interface SeedSurahsRequest {
  itemId?: string;
  pattern?: string; // افتراضي: '{pad3}.mp3'
  from?: number; // 1
  to?: number; // 114
}

export interface SeedSurahsResponse {
  success: boolean;
  count: number;
  reciterId: string;
  itemId: string;
  sampleUrl: string;
  message?: string;
}
