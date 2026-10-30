# رتل — Vercel + Neon + Archive.org

**Stack النهائي المعتمد:** Next.js 14 · Vercel · Neon PostgreSQL · Archive.org  
**المبدأ الحاكم:** ثابت أولاً للمستخدم (Static-First)، ديناميكي فقط للمدير (Dynamic Admin Only).

---

## 1. لماذا هذا الثلاثي؟

| الخدمة | الدور | المزايا والحدود المجانية |
|---|---|---|
| **Vercel** | استضافة + Serverless Functions + Global Edge CDN | 100 GB bandwidth/شهر + أداء استجابة فائق |
| **Neon** | PostgreSQL serverless (يصفر التكلفة عند عدم الاستخدام) | 0.5 GB + 191 compute-hr/شهر (لا توقف للمشروع أبداً) |
| **Archive.org** | تخزين صوت دائم بلا حدود + روابط مباشرة ثابتة | غير محدود + دعم أصيل لـ Range Requests و CORS |

> [!NOTE]
> **ميزة Neon التنافسية:** على عكس Supabase التي تُوقف المشاريع المجانية بعد 7 أيام خمول، Neon **تبقى شغّالة للأبد** وتُفوتر فقط على الاستخدام الفعلي للعمليات الحاسوبية.

---

## 2. نظرة عامة على المعمارية

```text
┌──────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
│  Next.js 14 (App Router) + TypeScript                       │
└──────────────────────────┬───────────────────────────────────┘
                           │ git push → main
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    Vercel Build                              │
│  node scripts/verify-text.mjs   ← checksum النص القرآني    │
│  node scripts/build-data.mjs    ← JSON ثابت                │
│  node scripts/build-search.mjs  ← فهرس البحث               │
│  next build                     ← SSG + Serverless          │
└──────────┬───────────────────────────────────────────────────┘
           │
    ┌──────┴──────────────────────────────┐
    ▼                                     ▼
┌─────────────────────┐       ┌────────────────────────────┐
│   Vercel Edge CDN   │       │   Neon PostgreSQL          │
│                     │       │   (Serverless)             │
│  /surah/[id]        │       │                            │
│  /reciter/[id]      │ ←───→ │  reciters                  │
│  /                  │       │  surah_audio               │
│  (HTML ثابت SSG)    │       │  reports                   │
│                     │       │  health_logs               │
│  /api/reciters      │       │                            │
│  /api/reports       │       │  تُستعلم فقط من API Routes │
│  /api/health        │       │  لا تُلمس في صفحات SSG    │
└─────────────────────┘       └────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│                  Archive.org                                 │
│  https://archive.org/download/ratil-{reciter}/{surah}.mp3   │
│  روابط مباشرة ثابتة للأبد · Range Requests ✅ · CORS ✅    │
└──────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│                 Browser (Client)                             │
│  Player.tsx       → React Client Component                  │
│  SearchBox.tsx    → MiniSearch في المتصفح                  │
│  Service Worker   → Audio cache + Offline                  │
│  localStorage     → آخر موضع + إعدادات                    │
│  Media Session    → تحكم شاشة القفل                       │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. هيكل المستودع المنظّم (Clean Modular Structure)

```text
ratil/
│
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (RTL + IBM Plex Sans Arabic)
│   ├── page.tsx                      # الصفحة الرئيسية (SSG)
│   │
│   ├── surah/
│   │   └── [id]/
│   │       └── page.tsx              # /surah/18 (SSG - 114 سورة)
│   │
│   ├── reciter/
│   │   └── [id]/
│   │       ├── page.tsx              # ملف القارئ (SSG)
│   │       └── surah/
│   │           └── [sid]/page.tsx    # /reciter/al-minshawy/surah/18
│   │
│   ├── bookmarks/page.tsx            # صفحة المحفوظات
│   ├── reciters/page.tsx             # فهرس القرّاء
│   ├── admin/page.tsx                # لوحة الإدارة المباشرة (ADMIN_SECRET)
│   │
│   └── api/                          # Serverless Functions
│       ├── reciters/
│       │   ├── route.ts              # GET (قائمة) / POST (إضافة قارئ)
│       │   └── [id]/route.ts         # GET / PUT / DELETE
│       ├── audio/
│       │   └── route.ts              # GET (استعلام) / POST (إضافة صوت)
│       ├── reports/
│       │   ├── route.ts              # POST (بلاغ مستخدم) / GET (للمدير)
│       │   └── [id]/route.ts         # PATCH / DELETE (إشراف)
│       └── health/
│           └── route.ts              # GET (فحص Archive.org و Range Requests)
│
├── components/                       # مكونات واجهة المستخدم العامة
│   ├── Player.tsx                    # 'use client' — المشغّل المتقدم
│   ├── SearchBox.tsx                 # 'use client' — البحث الفوري
│   ├── OfflineButton.tsx             # 'use client' — التنزيل للاستماع دون إنترنت
│   ├── SurahList.tsx                 # Server Component
│   ├── ReciterCard.tsx               # Server Component
│   ├── SurahText.tsx                 # عرض النص القرآني المعتمد
│   ├── Navbar.tsx                    # الشريط العلوي
│   ├── Footer.tsx                    # التذييل
│   └── Logo.tsx                      # شعار منصة رتّل
│
├── lib/
│   ├── db.ts                         # اتصال Neon serverless
│   ├── queries/                      # دوال استعلام SQL لقاعدة البيانات
│   │   ├── reciters.ts               # SQL للقرّاء
│   │   ├── audio.ts                  # SQL للصوتيات
│   │   └── reports.ts                # SQL للبلاغات
│   ├── normalize.ts                  # خوارزمية تطبيع البحث القرآني
│   ├── storage.ts                    # مساعدات localStorage
│   ├── media-session.ts              # تحكم شاشة القفل والأجهزة
│   └── types.ts                      # تعريفات TypeScript
│
├── scripts/                          # أدوات البناء والصيانة (Node.js ESM)
│   ├── verify-text.mjs               # التحقق الإلزامي من بصمات SHA-256
│   ├── build-data.mjs                # معالجة وتجهيز نصوص السور والآيات
│   ├── build-search.mjs              # توليد فهرس البحث
│   └── init-db.mjs                   # تهيئة وتغذية جداول Neon
│
├── data/                             # البيانات المصدرية في المستودع
│   ├── source/
│   │   ├── quran-hafs.txt            # نص حفص المعتمد (Tanzil v1.1)
│   │   └── quran-uthmani-warsh.json  # نص ورش المعتمد (مجمع الملك فهد KFGQPC v10)
│   ├── checksums.json                # البصمات المرجعية لجميع النصوص والخطوط
│   └── surahs.json                   # بيانات السور الـ 114
│
├── public/
│   ├── fonts/
│   │   ├── hafs.woff2                # خط مجمع الملك فهد لحفص
│   │   └── warsh.woff2               # خط مجمع الملك فهد لورش
│   ├── data/                         # بيانات ثابتة للمتصفح
│   │   ├── surahs-text/              # 114 ملف JSON للآيات
│   │   ├── hafs/ & warsh/            # النصوص المفهرسة للروايتين
│   │   └── search-index.json         # فهرس البحث اللحظي
│   └── sw.js                         # خادم الخدمة (PWA Service Worker)
│
├── db/
│   └── schema.sql                    # مخطط قاعدة بيانات Neon PostgreSQL
├── package.json
├── next.config.mjs
└── .env.local                        # متغيرات البيئة الآمنة (DATABASE_URL + ADMIN_SECRET)
```

---

## 4. قاعدة البيانات — Neon Schema

```sql
-- ─── 1. القرّاء ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reciters (
  id              VARCHAR(60)  PRIMARY KEY,  -- 'al-minshawy'
  name            TEXT         NOT NULL,     -- 'الشيخ محمد صديق المنشاوي'
  riwaya          VARCHAR(20)  NOT NULL,     -- 'hafs' | 'warsh' | 'qalon'
  license         VARCHAR(50)  NOT NULL,     -- 'public-domain' | 'cc-by' | 'permission'
  source_name     TEXT         NOT NULL,     -- 'Egyptian Radio Archive'
  source_url      TEXT,
  license_url     TEXT,
  is_visible      BOOLEAN      DEFAULT FALSE,
  notes           TEXT,                      -- ملاحظات داخلية للمدير
  created_at      TIMESTAMPTZ  DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- ─── 2. الملفات الصوتية ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS surah_audio (
  id               SERIAL      PRIMARY KEY,
  reciter_id       VARCHAR(60) REFERENCES reciters(id) ON DELETE CASCADE,
  surah_number     SMALLINT    NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  audio_url        TEXT        NOT NULL,  -- archive.org/download/...
  timings_url      TEXT,                  -- JSON توقيت الآيات
  duration_seconds INTEGER,
  size_mb          NUMERIC(6,2),
  verified         BOOLEAN     DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (reciter_id, surah_number)
);

-- ─── 3. البلاغات ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id           SERIAL      PRIMARY KEY,
  type         VARCHAR(20) NOT NULL,       -- 'text' | 'audio' | 'request'
  surah_number SMALLINT,
  ayah_number  SMALLINT,
  reciter_id   VARCHAR(60),
  description  TEXT        NOT NULL,
  status       VARCHAR(20) DEFAULT 'new',  -- 'new' | 'reviewed' | 'closed'
  admin_notes  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. سجل فحص الصوت ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_logs (
  id               SERIAL      PRIMARY KEY,
  reciter_id       VARCHAR(60),
  audio_url        TEXT,
  http_status      SMALLINT,
  supports_range   BOOLEAN,
  response_ms      INTEGER,
  error_msg        TEXT,
  checked_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. فهارس الأداء ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_audio_reciter   ON surah_audio (reciter_id);
CREATE INDEX IF NOT EXISTS idx_audio_surah     ON surah_audio (surah_number);
CREATE INDEX IF NOT EXISTS idx_reports_status  ON reports (status);
CREATE INDEX IF NOT EXISTS idx_health_reciter  ON health_logs (reciter_id, checked_at DESC);
```

---

## 5. الاتصال والاستعلام — Neon Database

```typescript
// lib/db.ts
import { neon } from '@neondatabase/serverless';

// Neon serverless driver — يعمل في Vercel Edge + Node.js
const sql = neon(process.env.DATABASE_URL!);

export default sql;
```

---

## 6. رفع الصوتيات إلى Archive.org

1. تسجيل حساب موثق على [Archive.org](https://archive.org/).
2. الرفع إلى قسم الصوتيات وتحديد المعرّف الفريد الثابت (Identifier):
   `ratil-{reciter_id}-{riwaya}` (مثال: `ratil-al-minshawy-hafs`).
3. تسمية السور بالتسلسل المعياري الثلاثي: `001.mp3`, `002.mp3`, ..., `114.mp3`.
4. الحصول على الروابط المباشرة الثابتة:
   `https://archive.org/download/ratil-{reciter_id}-{riwaya}/{surah_number_3_digits}.mp3`
5. تسجيل الرابط في Neon عبر جدول `surah_audio`.

---

## 7. تكاليف التشغيل والحدود

| الخدمة | الحد المجاني | الاستهلاك المتوقع | التكلفة |
|---|---|---|---|
| **Vercel** | 100 GB Bandwidth/شهر | 5-15 GB (صفحات و JS فقط) | **$0** |
| **Neon** | 0.5 GB تخزين + 191 Compute-hr | ~10 MB بيانات | **$0** |
| **Archive.org** | غير محدود | تخزين وبث الصوت بالكامل | **$0** |
| **GitHub Actions** | 2000 دقيقة/شهر | فحص وبناء تلقائي | **$0** |
| **النطاق ratil.app** | — | تجديد سنوي | ~$10/سنة |
| **المجموع** | | | **~$0.85/شهر** |
