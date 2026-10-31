/**
 * رتل - Ratil
 * أنواع ومعرّفات عناصر التنقل والهوية البصرية
 * features/navigation/types/navigation.types.ts
 */

import type { LucideIcon } from 'lucide-react';

export interface NavLinkItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export interface ArchitectureItem {
  icon: LucideIcon;
  text: string;
}

export interface FooterLinkItem {
  href: string;
  label: string;
  highlight?: boolean;
}
