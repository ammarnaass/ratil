/**
 * رتل - Ratil
 * ثوابت ونصوص الصفحة الرئيسية (Home Page Constants)
 * features/home/constants/home.constants.ts
 */

export const DEFAULT_INITIAL_SURAH_ID = 18;
export const DEFAULT_INITIAL_SURAH_NAME = 'الكهف';

export interface IntegrityPledgeDetail {
  id: string;
  title: string;
  desc: string;
  badge: string;
  icon: 'fingerprint' | 'user-check' | 'cloud-download';
}

export const INTEGRITY_PLEDGE_DETAILS: IntegrityPledgeDetail[] = [
  {
    id: 'sha256',
    title: 'نصوص محققة ببصمات SHA-256',
    desc: 'فحص آلي صارم يطابق نصوص Tanzil ومجمع الملك فهد قبل كل بناء.',
    badge: '100% موثق',
    icon: 'fingerprint',
  },
  {
    id: 'human',
    title: 'أصوات بشرية خالصة',
    desc: 'لا تلاوات مولدة بالذكاء الاصطناعي — أصوات حقيقية لكبار أئمة التلاوة.',
    badge: 'تلاوات حية',
    icon: 'user-check',
  },
  {
    id: 'archive',
    title: 'تخزين دائم للأبد عبر Archive.org',
    desc: 'روابط ثابتة مباشرة تدعم تقنية Range Requests للبث المباشر الفوري.',
    badge: 'مدى الحياة',
    icon: 'cloud-download',
  },
];

export const INTEGRITY_PLEDGES = [
  'بصمة SHA-256 للنص القرآني مفحوصة آلياً قبل كل بناء.',
  'لا تلاوات مولدة بالذكاء الاصطناعي — أصوات بشرية موثقة فقط.',
  'روابط دائمة تدعم Range Requests للبث المباشر السلس.',
] as const;

