/**
 * رتل - Ratil
 * ثوابت وقوائم روابط التنقل والهوية والمعمارية
 * features/navigation/constants/navigation.constants.ts
 */

import {
  Volume2,
  BookOpen,
  Users,
  Bookmark,
  ShieldCheck,
  Radio,
  Database,
  Cloud,
} from 'lucide-react';
import type { NavLinkItem, ArchitectureItem, FooterLinkItem } from '../types/navigation.types';

export const PRIMARY_NAV_LINKS: NavLinkItem[] = [
  { href: '/', label: 'الرئيسية', icon: Volume2 },
  { href: '/surah/1', label: 'المصحف', icon: BookOpen },
  { href: '/reciters', label: 'القرّاء', icon: Users },
  { href: '/bookmarks', label: 'المحفوظات', icon: Bookmark },
];

export const SYSTEM_ARCHITECTURE_ITEMS: ArchitectureItem[] = [
  { icon: ShieldCheck, text: 'نص حفص: مشروع تنزيل (Tanzil v1.1)' },
  { icon: ShieldCheck, text: 'نص ورش: مجمع الملك فهد (KFGQPC v10)' },
  { icon: Radio, text: 'تخزين الصوت: Archive.org دائم للأبد' },
  { icon: Database, text: 'قاعدة البيانات: Neon Serverless Postgres' },
  { icon: Cloud, text: 'استضافة سريعة: Vercel Edge CDN' },
];

export const GOVERNANCE_LINKS: FooterLinkItem[] = [
  { href: '/admin', label: 'لوحة الحوكمة والقرّاء' },
  { href: '/reciters', label: 'قائمة القرّاء والتراخيص' },
  { href: '/bookmarks', label: 'المحفوظات الشخصية' },
  { href: '/login', label: 'تسجيل الدخول / حساب جديد', highlight: true },
];
