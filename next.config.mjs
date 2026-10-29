/** @type {import('next').NextConfig} */
const nextConfig = {
  // لا output: 'export' هنا — next يُقرر تلقائياً
  // الصفحات التي تحتوي generateStaticParams → HTML ثابت
  // /api/* → Serverless Functions على Vercel
  images: {
    unoptimized: true, // لتجنب تكاليف Vercel Image Optimization
  },
  experimental: {
    // تشغيل Webpack في العملية الرئيسية لتفادي أخطاء SIGBUS في بيئات الحاويات وWorker threads
    webpackBuildWorker: false,
    // تشغيل قواعد البيانات في Edge Runtime (أسرع)
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },
  async redirects() {
    return [
      {
        source: '/admin.html',
        destination: '/admin',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
