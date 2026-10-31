# خطة المعمارية لنظام التصميم الموحد (الألوان والخطوط) لمنصة «رتّل»
**وفق ميثاق المعمارية المعيارية الموجهة بالميزات:** [Feature Modular Structure](file:///home/ammar/ratil/.agents/skills/feature-modular-structure/SKILL.md)  
**الهدف الأساسي:** جعل أي تعديل مستقبلي على الألوان، الهوية البصرية، وأحجام ونوع خطوط القرآن يتم من **مكان واحد فقط (Single Source of Truth)** وبكل سهولة وأمان دون تشتت بين الملفات.

---

## 1. تشخيص الوضع الحالي ونقاط الألم (Current Pain Points)

| المشكلة الحالية | أين تقع؟ | الأثر السلبي |
|---|---|---|
| **ازدواجية قيم الألوان** | موزعة بين قيم RGB في `app/globals.css`، وقيم Hex في `features/theme/constants/colors.constants.ts`، و `tailwind.config.js`. | تغيير لون التمييز أو الخلفية يتطلب تعديل 3 ملفات مختلفة بصيغ مختلفة (RGB مقابل Hex). |
| **عزل محددات الخطوط** | خطوط القرآن (حفص وورش) وأحجامها محددة في `typography.constants.ts` لكن يتم استدعاؤها بفئات Tailwind ثابتة (`text-2xl`، `text-3xl`). | صعوبة تقديم ميزة تكبير/تصغير خط المصحف للمستخدم بسلاسة. |
| **غياب التوليد الآلي** | ملف `tokens.json` في `design-system/` منفصل تماماً عن الكود البرمجي النشط للتطبيق. | عدم تزامن التوثيق مع الكود الحقيقي. |

---

## 2. الرؤية المعمارية لنظام التصميم المقترح (Architecture Vision)

سنعتمد معمارية **المصدر الموحد (Single Source of Truth)** وفق الهيكل التالي:

```text
TypeScript Tokens (مصدر الحقيقة الوحيد والأشمل)
        │
        ├───► Tailwind Config (تغذية فئات Tailwind برمجياً)
        ├───► CSS Variables (تغذية متغيرات :root و html.dark/light في globals.css)
        └───► React Components & Hooks (استخدام القيم في المشغل، قارئ المصحف، والـ Context)
```

بهذه الطريقة: **عند تغيير أي لون أو حجم خط في ملف المحددات (Tokens)، يتحدث تلقائياً وبشكل فوري في كل من Tailwind، وملف CSS، والمكونات البرمجية.**

---

## 3. الشجرة الهيكلية لميزة نظام التصميم (`features/theme/` أو `features/design-system/`)

سننظم النظام داخل `features/theme/` (ليكون هو الحزمة المسؤولة عن المظهر ونظام التصميم كلياً)، مقسماً إلى ملفات صغيرة أحادية المسؤولية:

```text
features/theme/
├── index.ts                         # البوابة العامة للميزة (Public API)
│
├── tokens/                          # محددات التصميم (مقسمة ومفصولة)
│   ├── colors.tokens.ts             # كافة درجات الألوان (Dark/Light + Hex + RGB)
│   ├── typography.tokens.ts         # خطوط الواجهة والمصحف وأحجامها وارتفاعات الأسطر
│   └── elevation.tokens.ts          # الظلال والحدود والشفافيات الزجاجية (Glassmorphism)
│
├── types/                           # الأنواع والواجهات الصارمة
│   ├── theme.types.ts               # أنواع أنماط المظهر (dark, light, system)
│   ├── colors.types.ts              # واجهات الألوان والـ RGB والتباين
│   └── typography.types.ts          # أحجام الخطوط، الروايات، ومقاييس القراءة
│
├── context/                         # سياق React لإدارة المظهر وإعدادات الخط
│   ├── theme.context.ts             # سياق نمط المظهر
│   └── quran-font.context.ts        # سياق تفضيلات القارئ (حجم الخط والرواية)
│
├── hooks/                           # خطافات إدارة الحالة
│   ├── useTheme.ts                  # التبديل بين النهاري/الليلي
│   └── useQuranFont.ts              # التحكم في تكبير/تصغير وتغيير خط السورة
│
├── utils/                           # دوال التحويل والتطبيق البرمجي
│   ├── color.utils.ts               # تحويل Hex إلى RGB للـ CSS Variables
│   ├── css-vars.utils.ts            # توليد أو تنسيق مصفوفات المتغيرات
│   └── theme.utils.ts               # قراءة التخزين المحلي وتطبيق الكلاسات على DOM
│
└── components/                      # المكونات البصرية التفاعلية
    ├── ThemeProvider.tsx            # مزود السياق الشامل للتطبيق
    ├── ThemeToggle.tsx              # زر التبديل الدائري بين الشمسي والقمري
    ├── FontScaleControl.tsx         # شريط تفاعلي لتكبير وتصغير خط المصحف (أ- / أ+)
    └── ColorPaletteShowcase.tsx     # لوحة استعراض منظومة الألوان والتباين (للمدير والمطور)
```

---

## 4. مسؤولية كل ملف ودوره بالتفصيل (Single Responsibility)

| الملف | المسؤولية المحددة | أقصى سطر متوقع |
|---|---|:---:|
| `tokens/colors.tokens.ts` | تعريف جميع الألوان (الفيروزي، الخلفيات، أسطح الكروت، نصوص القرآن) بصيغة مركزية. | ~90 سطر |
| `tokens/typography.tokens.ts` | تعريف أسماء الخطوط، مقاسات الجوال، مقاسات الشاشات الكبيرة، وارتفاعات الأسطر. | ~60 سطر |
| `tokens/elevation.tokens.ts` | تعريف درجات الشفافية وتأثير الزجاج وتوهج اللون الفيروزي. | ~45 سطر |
| `utils/color.utils.ts` | دوال نقية لتحويل درجات الألوان وإنتاج أرقام RGB لدعم `<alpha-value>` في Tailwind. | ~50 سطر |
| `context/quran-font.context.ts` | إدارة إعدادات حجم خط القرآن المفضل للمستخدم وحفظه في `localStorage`. | ~40 سطر |
| `hooks/useQuranFont.ts` | توفير دوال بسيطة للمكونات: `fontSize`, `increaseFont()`, `decreaseFont()`. | ~40 سطر |
| `components/FontScaleControl.tsx`| عنصر واجهة أنيق يوضع في صفحة السورة لتكبير/تصغير الخط فورياً. | ~65 سطر |
| `index.ts` | تصدير البوابة العامة للمشروع ليتم استيراد كل شيء عبر `@/features/theme`. | ~45 سطر |

---

## 5. خطة التكامل مع Tailwind و `globals.css` (Integration Strategy)

### أ. ملف `tailwind.config.js`:
بدلاً من كتابة كود مكرر يدوي، سيستورد `tailwind.config.js` أسماء المتغيرات مباشرة أو يعتمد أسماء معيارية متطابقة مع `colors.tokens.ts`:
```javascript
// tailwind.config.js
import { TAILWIND_COLOR_MAPPINGS, FONT_FAMILY_MAPPINGS } from './features/theme/tokens/tailwind-bindings';
```

### ب. ملف `app/globals.css`:
تنظيم المتغيرات في قسمين نظيفين وموثقين:
1. `:root, html.dark` (القيم الليلية القياسية المستخرجة من `colors.tokens.ts`).
2. `html.light` (القيم النهارية المتطابقة المستخرجة من `colors.tokens.ts`).
3. تعريفات `@font-face` لخطوط المصحف:
   - `hafs.woff2` (حفص عن عاصم - Tanzil)
   - `warsh.woff2` (ورش عن نافع - مجمع الملك فهد)

---

## 6. مراحل التنفيذ خطوة بخطوة (Step-by-Step Implementation)

1. **المرحلة 1: بناء مجلد المحددات (`features/theme/tokens/`)**
   - كتابة `colors.tokens.ts` متضمناً قيم الوضعين (Dark & Light) والـ RGB المكافئ.
   - كتابة `typography.tokens.ts` متضمناً درجات الخط القرآني (صغير 20px، متوسط 22px، كبير 26px، ضخم 32px) والخط الإداري IBM Plex Sans Arabic.
   - كتابة أدوات التحويل `color.utils.ts`.

2. **المرحلة 2: توحيد ملف `globals.css` و `tailwind.config.js`**
   - مطابقة قيم المتغيرات في `globals.css` بنسبة 100% مع `colors.tokens.ts`.
   - التأكد من أن جميع أسماء الألوان المعرفة في Tailwind تعمل بسلاسة وبشفافيات متعددة (Opacity-safe).

3. **المرحلة 3: خطاف ومكون التحكم في حجم الخط القرآني**
   - إنشاء سياق وخطاف `useQuranFont` لحفظ حجم خط المصحف في `localStorage`.
   - ربط صفحة قراءة السورة [`features/quran/components/SurahText.tsx`](file:///home/ammar/ratil/features/quran/components/SurahText.tsx) بالحجم الديناميكي لتمكين التكبير والتصغير الفوري.
   - إنشاء مكون `FontScaleControl` لشاشات تلاوة وقراءة السور.

4. **المرحلة 4: التصدير والاختبار النهائي**
   - تحديث `features/theme/index.ts` بكافة المكونات والأدوات الجديدة.
   - تشغيل `npx tsc --noEmit` للتحقق التام من خلو الأنواع من أي تعارض.
   - التحقق من عمل خادم التطوير `npm run dev` واختبار التبديل الفوري بين الوضع الليلي والنهاري وتغيير أحجام الخطوط.

---

## 7. آلية التعديل المستقبلية فائقة السهولة (Future Maintenance)

بعد تطبيق هذه الخطة:
- **لتغيير أي لون:** يدخل المطور فقط إلى `features/theme/tokens/colors.tokens.ts` ويغير القيمة (Hex أو RGB)، فيتغير التطبيق كاملاً.
- **لإضافة أو تعديل حجم خط قرآن:** يدخل فقط إلى `features/theme/tokens/typography.tokens.ts` ويعدل القيمة.
- **لا حاجة للبحث في عشرات الملفات أو تعديل كود React إطلاقاً.**
