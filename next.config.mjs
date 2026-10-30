// منع فحص Next.js التلقائي لحزم SWC في lockfile أثناء البناء
process.env.NEXT_IGNORE_INCORRECT_LOCKFILE = '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // لا output: 'export' هنا — next يُقرر تلقائياً
  // الصفحات التي تحتوي generateStaticParams → HTML ثابت
  // /api/* → Serverless Functions على Vercel
  images: {
    unoptimized: true, // لتجنب تكاليف Vercel Image Optimization
  },
  experimental: {
    // تشغيل Webpack في العملية الرئيسية لتفادي أخطاء DataCloneError مع Worker threads
    webpackBuildWorker: false,
    // تشغيل قواعد البيانات في Edge Runtime (أسرع)
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },
};

export default nextConfig;
