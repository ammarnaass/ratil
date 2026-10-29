import type { Metadata } from 'next';
import { AuthCard, RegisterForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'إنشاء حساب جديد — رتّل',
  description: 'أنشئ حسابك المجاني في رتّل للوصول إلى كافة ميزات المزامنة السحابية للمصحف الشريف.',
};

export default function RegisterPage() {
  return (
    <div className="w-full min-h-[calc(100vh-220px)] flex items-center justify-center px-4 py-12">
      <AuthCard
        title="إنشاء حساب في رتّل"
        subtitle="انضم لمزامنة مصحفك وآياتك المحفوظة وتقدم استماعك بأمان وسرية تامة"
      >
        <RegisterForm />
      </AuthCard>
    </div>
  );
}
