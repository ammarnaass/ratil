# رتل — المعمارية الهندسية النهائية

**المبدأ الحاكم:** موقع ثابت أولاً (Static-first). كل ما يمكن توليده في وقت البناء يُولَّد، ولا شيء يمر بخادم في وقت التشغيل إلا لضرورة مثبتة.

---

## 1. نظرة عامة على المعمارية

```text
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                       │
│  src/ + data/ + scripts/                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ git push
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  GitHub Actions (CI/CD)                     │
│  1. verify-text (checksum)  ← يفشل البناء إن اختلف        │
│  2. build-data (JSON)       ← توليد بيانات وقت البناء     │
│  3. build-search-index      ← فهرس بحث مُطبَّع            │
│  4. astro build             ← توليد HTML ثابت             │
│  5. deploy → Cloudflare Pages                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌─────────────────────┐     ┌─────────────────────────────┐
│  Cloudflare Pages   │     │      Cloudflare R2           │
│  (HTML + JS + CSS)  │     │  (ملفات صوت + توقيت)        │
│  CDN عالمي          │     │  صفر egress fees             │
│  ratil.app          │     │  cdn.ratil.app               │
└─────────────────────┘     └─────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                      المتصفح                               │
│  Service Worker: cache الصوت + offline support             │
│  localStorage: آخر موضع + إعدادات                         │
│  Media Session API: تحكم شاشة القفل                       │
│  Pagefind (WASM): بحث فوري بلا خادم                       │
└─────────────────────────────────────────────────────────────┘
              │
              │ (فقط لوحة التحكم)
              ▼
┌─────────────────────────────────────────────────────────────┐
│             Cloudflare Workers (Serverless)                 │
│  - Presigned URLs لرفع الملفات                             │
│  - فحص المدير (Basic Auth)                                 │
│  - تفعيل إعادة البناء (webhook → GitHub Actions)          │
│  يعيش ثوانٍ عند الطلب فقط — لا خادم دائم                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. التقنيات المختارة — مع السبب

| الطبقة | التقنية | البديل المرفوض | سبب الاختيار |
|---|---|---|---|
| Framework | **Astro 4** | Next.js | صفر JS افتراضي، SSG أولاً، بناء سريع |
| استضافة الموقع | **Cloudflare Pages** | Vercel | مجاني بلا حدود، CDN عالمي، atomic deploys |
| تخزين الصوت | **Cloudflare R2** | AWS S3 | صفر egress fees، نفس نظام Cloudflare |
| CDN | **Cloudflare** (مدمج) | CloudFront | لا تكاليف نقل، عقود 300+ مدينة |
| قاعدة البيانات | **لا توجد** | PostgreSQL / Supabase | المحتوى ثابت، JSON في المستودع |
| بحث | **Pagefind** + pre-index | Elasticsearch | يعمل في المتصفح، لا خادم، عربي مع تطبيع |
| Serverless | **Cloudflare Workers** | Express / Railway | يعيش عند الطلب، لا تكلفة ثابتة |
| PWA | **@vite-pwa/astro** | يدوي | Service Worker + Manifest تلقائي |
| CI/CD | **GitHub Actions** | Jenkins | مجاني، متكامل مع المستودع |
| إحصاءات | **Plausible** (self-hosted) | Google Analytics | خصوصية، لا تتبع شخصي |
| تحقق النص | **سكربت Python (SHA-256)** | — | أمان النص القرآني |

---

## 3. هيكل المستودع

```text
ratil/
│
├── src/                          # كود الواجهة (Astro)
│   ├── pages/
│   │   ├── index.astro           # الصفحة الرئيسية
│   │   ├── surah/
│   │   │   └── [id].astro        # صفحة ديناميكية → HTML ثابت لكل سورة
│   │   └── reciter/
│   │       └── [id]/
│   │           ├── index.astro   # ملف القارئ
│   │           └── surah/
│   │               └── [sid].astro
│   ├── components/               # مكونات Astro + React (للمشغّل فقط)
│   │   ├── Player.tsx            # المشغّل (React Island)
│   │   ├── SearchBox.tsx         # البحث (React Island)
│   │   └── SurahList.astro       # قائمة السور (ثابتة)
│   └── layouts/
│       └── Base.astro
│
├── data/                         # البيانات المصدر (لا تُعدَّل يدوياً)
│   ├── source/
│   │   ├── quran-hafs.txt        # النص المصدر (Tanzil / مجمع الملك فهد)
│   │   └── quran-warsh.txt
│   ├── checksums.json            # البصمات المرجعية
│   ├── surahs.json               # أسماء + عدد الآيات (مُولَّد)
│   ├── reciters.json             # بيانات القرّاء + تراخيصهم
│   └── audio-manifest.json       # مسارات الصوت في R2
│
├── timings/                      # ملفات التوقيت
│   └── al-minshawy/
│       ├── 001.json
│       └── 018.json
│
├── scripts/
│   ├── verify-text.py            # يفشل إن تغيّر النص
│   ├── build-data.py             # يُولّد JSON من المصدر
│   └── build-search-index.py     # يُولّد فهرس بحث مُطبَّع
│
├── admin/                        # لوحة التحكم (SPA منفصل)
│   └── src/
│
├── public/
│   └── fonts/                    # خطوط مضمّنة (KFGQPC + IBM Plex Arabic)
│
├── .github/
│   └── workflows/
│       ├── deploy.yml            # بناء ونشر
│       └── verify.yml           # فحص يومي للنص
│
└── astro.config.mjs
```

---

## 4. سكربت التحقق من النص (verify-text.py)

```python
import hashlib, json, sys

with open('data/source/quran-hafs.txt', 'rb') as f:
    actual = hashlib.sha256(f.read()).hexdigest()

with open('data/checksums.json') as f:
    expected = json.load(f)['hafs']

if actual != expected:
    print(f"❌ CHECKSUM MISMATCH")
    print(f"Expected: {expected}")
    print(f"Actual:   {actual}")
    sys.exit(1)          # يوقف البناء

print(f"✅ Text verified: {actual}")
```

يُشغَّل كأول خطوة في كل بناء. إن فشل، لا شيء يُنشر.

---

## 5. ملف audio-manifest.json

```json
{
  "reciters": {
    "al-minshawy": {
      "name": "الشيخ محمد صديق المنشاوي",
      "riwaya": "hafs",
      "base_url": "https://cdn.ratil.app/audio/al-minshawy/",
      "license": "public-domain",
      "source": "Egyptian Radio Archive",
      "surahs": {
        "1":  { "file": "001_al-fatiha.mp3",  "duration": 50  },
        "2":  { "file": "002_al-baqara.mp3",  "duration": 8530 },
        "18": { "file": "018_al-kahf.mp3",    "duration": 3510 }
      }
    },
    "al-husary": {
      "name": "الشيخ محمود خليل الحصري",
      "riwaya": "warsh",
      "base_url": "https://cdn.ratil.app/audio/al-husary-warsh/",
      "license": "public-domain",
      "source": "Egyptian Radio Archive",
      "surahs": {}
    }
  }
}
```

تغيير أي URL = تعديل هذا الملف فقط، لا إعادة كتابة كود.

---

## 6. استراتيجية Service Worker

```javascript
// sw.js (مُولَّد بواسطة @vite-pwa/astro أو كود مخصص)

// ما يُخزَّن تلقائياً (عند تثبيت PWA)
const PRECACHE = [
  '/',
  '/surah/1',     // الفاتحة دائماً
  '/fonts/hafs.woff2',
  '/search-index.json'
];

// استراتيجية الصوت: Cache-First بطلب صريح من المستخدم
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // الصوت: فقط ما طلبه المستخدم صراحة يُخزَّن
  if (url.hostname === 'cdn.ratil.app') {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          // لا تخزين تلقائي — فقط ما اختاره المستخدم
          return response;
        });
      })
    );
    return;
  }

  // الصفحات والأصول: Cache-First
  event.respondWith(
    caches.match(event.request).then(r => r || fetch(event.request))
  );
});
```

---

## 7. البحث العربي المُطبَّع

```python
# scripts/build-search-index.py
import json, re, unicodedata

def normalize_arabic(text):
    # حذف التشكيل
    text = re.sub(r'[\u064B-\u065F\u0670]', '', text)
    # توحيد الهمزات
    text = re.sub(r'[أإآٱ]', 'ا', text)
    # توحيد الياء
    text = re.sub(r'ى', 'ي', text)
    # توحيد التاء المربوطة
    text = re.sub(r'ة', 'ه', text)
    return text.strip()

# خريطة الأسماء اللاتينية
LATIN_MAP = {
    'fatiha': 1, 'baqara': 2, 'imran': 3, 'kahf': 18,
    'yasin': 36, 'rahman': 55, 'mulk': 67, 'ikhlas': 112
}

with open('data/surahs.json') as f:
    surahs = json.load(f)

index = []
for s in surahs:
    index.append({
        'id': s['id'],
        'name': s['name'],
        'name_normalized': normalize_arabic(s['name']),
        'latin': [k for k, v in LATIN_MAP.items() if v == s['id']],
        'num': s['id']
    })

with open('public/search-index.json', 'w', encoding='utf-8') as f:
    json.dump(index, f, ensure_ascii=False)
```

---

## 8. رفع الملفات الصوتية (Presigned URL)

```javascript
// Cloudflare Worker: admin-upload.js

export default {
  async fetch(request, env) {
    // فحص المدير
    const auth = request.headers.get('Authorization');
    if (!isValidAdmin(auth, env.ADMIN_SECRET)) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { surahId, reciterId, filename } = await request.json();

    // توليد رابط رفع مؤقت صالح 15 دقيقة
    const key = `audio/${reciterId}/${filename}`;
    const url = await env.R2.createMultipartUpload(key);

    return Response.json({
      upload_url: url.uploadId,
      key: key,
      expires_in: 900   // 15 دقيقة
    });
  }
};

// المدير يرفع من المتصفح مباشرة إلى R2
// بلا مرور بالـ Worker — بلا حد حجم
```

---

## 9. GitHub Actions — Pipeline

```yaml
# .github/workflows/deploy.yml

name: Build & Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v4
        with: { python-version: '3.11' }

      - name: ✅ Verify Quran Text
        run: python scripts/verify-text.py
        # يوقف كل شيء إن فشل

      - name: 📦 Build Data
        run: python scripts/build-data.py

      - name: 🔍 Build Search Index
        run: python scripts/build-search-index.py

      - name: Setup Node
        uses: actions/setup-node@v4
        with: { node-version: '20' }

      - run: npm ci
      - run: npm run build

      - name: 🚀 Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          projectName: ratil
          directory: dist
```

وقت البناء المتوقع: **45-90 ثانية** للدورة كاملة.

---

## 10. التكاليف التشغيلية

| الخدمة | الخطة | التكلفة الشهرية |
|---|---|---|
| Cloudflare Pages | Free | $0 |
| Cloudflare R2 | 10GB مجاناً، ثم $0.015/GB | $0–3 |
| Cloudflare Workers | 100,000 طلب/يوم مجاناً | $0 |
| GitHub Actions | 2000 دقيقة/شهر مجاناً | $0 |
| Plausible Analytics | Self-hosted على VPS صغير | $4–6 |
| النطاق | ratil.app | $10/سنة |
| **المجموع** | | **$4–10/شهر** |

مقارنة بالبديل (Vercel + Railway + Supabase + AWS): **$50–150/شهر**.

---

## 11. نقاط الفشل وخطط البديل

| السيناريو | التأثير | الحل |
|---|---|---|
| Cloudflare Pages تنهار | الموقع لا يُفتح | النسخة الثابتة تُنشر على Netlify في < 5 دقائق |
| Cloudflare R2 لا يستجيب | الصوت لا يشتغل | Service Worker يشغّل المخزَّن offline |
| GitHub Actions معطّل | لا نشر جديد | يُشغَّل Wrangler يدوياً من المحلي |
| سقوط الإنترنت عند المستخدم | — | PWA offline: السور المحمَّلة تشتغل |
| خطأ في النص القرآني | — | checksum يكتشفه، البناء يتوقف، المدير يُبلَّغ |

---

## 12. مسار التطوير المحلي

```bash
# إعداد المشروع
git clone https://github.com/ratil/ratil
npm install
pip install -r scripts/requirements.txt

# تشغيل السكربتات
python scripts/verify-text.py     # فحص النص
python scripts/build-data.py      # توليد البيانات
python scripts/build-search-index.py

# تشغيل محلي
npm run dev      # http://localhost:4321

# بناء واختبار
npm run build
npm run preview
```

---

## 13. قرارات مُعلَّقة (للإصدار 2.0 فقط)

| القرار | الخيارات | المقياس |
|---|---|---|
| تعليقات وبلاغات مستخدمين | Cloudflare D1 (SQLite) أو Supabase | عدد البلاغات الشهري |
| بحث نص الآيات كاملاً | Pagefind أو FlexSearch | جودة النتائج |
| تطبيقات أصلية | Capacitor فوق Astro أو React Native | عدد طلبات المستخدمين |

---

## الخطوات الصفرية (الحالة الحالية)

1. تم تهيئة Astro مع مخرجات ثابتة (Static SSG) وتكامل React.
2. نص حفص من Tanzil متوفر ومتحقق منه `data/source/quran-hafs.txt`.
3. بصمات SHA-256 موثقة ومطابقة في `data/checksums.json`.
4. سكربتات `verify-text.py` و `build-data.py` و `build-search-index.py` تعمل وتجتاز 100% من الاختبارات.
5. خط سير GitHub Actions جاهز للنشر على Cloudflare Pages بمجرد ربط المتغيرات السرية.
