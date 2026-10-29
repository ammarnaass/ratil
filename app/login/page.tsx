import type { Metadata } from 'next';
import { AuthCard, LoginForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'تسجيل الدخول — رتّل',
  description: 'سجّل دخولك لمزامنة آياتك المحفوظة وتقدم استماعك عبر جميع أجهزتك.',
};

export default function LoginPage() {
  return (
    <div className="w-full min-h-[calc(100vh-220px)] flex items-center justify-center px-4 py-12">
      <AuthCard
        title="مرحباً بعودتك"
        subtitle="سجّل دخولك لمزامنة وحفظ آياتك المفضلة وسجل الاستماع"
      >
        <LoginForm />
      </AuthCard>
    </div>
  );
}
