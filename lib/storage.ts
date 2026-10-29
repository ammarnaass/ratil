/**
 * رتل - Ratil
 * إدارة التخزين المحلي للمستخدم (localStorage helpers)
 * lib/storage.ts
 */

import type { Bookmark, PlaybackState } from './types';

const LAST_PLAYED_KEY = 'ratil_last_played';
const BOOKMARKS_KEY = 'ratil_bookmarks';
const RIWAYA_PREF_KEY = 'ratil_riwaya_pref';
const VOLUME_KEY = 'ratil_audio_volume';

export function saveLastPlayed(state: Partial<PlaybackState>): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLastPlayed() || {};
    const updated = { ...existing, ...state, updatedAt: Date.now() };
    localStorage.setItem(LAST_PLAYED_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save last played to localStorage', e);
  }
}

export function getLastPlayed(): (PlaybackState & { updatedAt?: number }) | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LAST_PLAYED_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getBookmarks(): Bookmark[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addBookmark(bookmark: Omit<Bookmark, 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getBookmarks();
    const exists = list.some(
      b => b.surahId === bookmark.surahId && b.ayahNumber === bookmark.ayahNumber
    );
    if (!exists) {
      list.unshift({ ...bookmark, timestamp: Date.now() });
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(list));
    }
  } catch (e) {
    console.error('Failed to add bookmark', e);
  }
}

export function removeBookmark(surahId: number, ayahNumber: number): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getBookmarks().filter(
      b => !(b.surahId === surahId && b.ayahNumber === ayahNumber)
    );
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to remove bookmark', e);
  }
}

export function isAyahBookmarked(surahId: number, ayahNumber: number): boolean {
  return getBookmarks().some(
    b => b.surahId === surahId && b.ayahNumber === ayahNumber
  );
}

export function getRiwayaPreference(): 'hafs' | 'warsh' {
  if (typeof window === 'undefined') return 'hafs';
  const val = localStorage.getItem(RIWAYA_PREF_KEY);
  return val === 'warsh' ? 'warsh' : 'hafs';
}

export function setRiwayaPreference(riwaya: 'hafs' | 'warsh'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RIWAYA_PREF_KEY, riwaya);
}
