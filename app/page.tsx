/**
 * رتل - Ratil
 * الصفحة الرئيسية (SSG — HTML ثابت فائق السرعة على Vercel Edge)
 * معمارية معيارية موجهة بالميزات (Feature-Driven Architecture)
 * app/page.tsx
 */

import { getVisibleReciters } from '@/lib/queries/reciters';
import surahs from '@/data/surahs.json';
import { HomePageView } from '@/features/home';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const reciters = await getVisibleReciters();
  return <HomePageView reciters={reciters} surahs={surahs as any} />;
}
