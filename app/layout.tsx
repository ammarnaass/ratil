/**
 * رتل - Ratil
 * Next.js Root Layout (RTL + Arabic Fonts + Vercel Edge Ready)
 * app/layout.tsx
 */

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar, Footer } from '@/features/navigation';
import { AuthProvider } from '@/features/auth';
import { ThemeProvider } from '@/features/theme';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ratil.app'),
  title: 'رتّل — مشغّل تلاوات القرآن الكريم مع تتبع الآية',
  description: 'مشغّل صوتي للقرآن الكريم سريع وبسيط. ثابت أولاً، مصادر Archive.org دائمة للأبد، نصوص محققة ببصمات SHA-256، وخالٍ تماماً من الإعلانات والتتبع.',
  keywords: ['القرآن الكريم', 'مشغل قرآن', 'رتل', 'حفص', 'ورش', 'تلاوات', 'Archive.org', 'Next.js'],
  authors: [{ name: 'رتل' }],
  openGraph: {
    title: 'رتّل — مشغّل تلاوات القرآن الكريم مع تتبع الآية',
    description: 'استمع إلى تلاوات كبار القرّاء بروايتي حفص وورش مع تتبع النص القرآني المعتمد بدقة وإتقان.',
    siteName: 'رتّل',
    locale: 'ar_SA',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111318',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className="bg-background text-on-surface flex flex-col min-h-screen selection:bg-primary-container selection:text-primary">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 w-full pb-28">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
