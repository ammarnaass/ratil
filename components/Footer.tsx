/**
 * رتل - Ratil
 * تذييل الصفحة الموثوق (Footer)
 * components/Footer.tsx
 */

import Link from 'next/link';
import { ShieldCheck, Database, Cloud, Radio, Heart } from 'lucide-react';
import Logo from '@/components/Logo';

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-surface-container-high py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* العمود الأول: الهوية */}
          <div className="flex flex-col gap-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <Logo size={36} />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary font-arabic">رَتِّلْ</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  مشروع مستقل خادم لكتاب الله
                </span>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-lg">
              مشغّل تلاوات القرآن الكريم مع تتبع الآية وعرض النص القرآني المعتمد. الوعد الذي يحمله الاسم هو التأنّي والإتقان، لا السرعة والحشو. خالٍ تماماً من الإعلانات والتتبع.
            </p>
            <p className="text-xs text-primary/80 font-quran-hafs mt-1">
              ﴿وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا﴾
            </p>
          </div>

          {/* العمود الثاني: المعمارية والمصادر */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-on-surface">معمارية النظام</h4>
            <ul className="flex flex-col gap-2 text-xs text-on-surface-variant">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>نص حفص: مشروع تنزيل (Tanzil v1.1)</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>نص ورش: مجمع الملك فهد (KFGQPC v10)</span>
              </li>
              <li className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-primary shrink-0" />
                <span>تخزين الصوت: Archive.org دائم للأبد</span>
              </li>
              <li className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary shrink-0" />
                <span>قاعدة البيانات: Neon Serverless Postgres</span>
              </li>
              <li className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-primary shrink-0" />
                <span>استضافة سريعة: Vercel Edge CDN</span>
              </li>
            </ul>
          </div>

          {/* العمود الثالث: الروابط والحوكمة */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-on-surface">المصداقية والحوكمة</h4>
            <div className="flex flex-col gap-2 text-xs text-on-surface-variant">
              <Link href="/admin" className="hover:text-primary transition-colors">
                لوحة الحوكمة والقرّاء
              </Link>
              <Link href="/reciters" className="hover:text-primary transition-colors">
                قائمة القرّاء والتراخيص
              </Link>
              <Link href="/bookmarks" className="hover:text-primary transition-colors">
                المحفوظات الشخصية
              </Link>
              <span className="text-[11px] text-on-surface-variant/70 mt-2">
                SHA-256 Text Verifier نشط في كل بناء
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <div>
            جميع الحقوق محفوظة للمسلمين عامة في خدمة القرآن الكريم. لا استخدام تجاري.
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span>صُنع بإتقان واحتساب</span>
            <Heart className="w-3.5 h-3.5 text-primary fill-primary" />
          </div>
        </div>
      </div>
    </footer>
  );
}
