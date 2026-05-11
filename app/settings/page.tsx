import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Shield, Smartphone } from 'lucide-react';
import { TwoFactorSettings } from './TwoFactorSettings';

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  const user = await prisma.users.findUnique({
    where: { id: currentUser.userId },
    select: {
      id: true,
      email: true,
      name: true,
      two_factor_enabled: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к профилю
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-emerald-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Безопасность
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Настройте двухфакторную аутентификацию для защиты аккаунта
            </p>
          </div>

          {/* 2FA Settings */}
          <div className="space-y-6">
            <div className="border-l-4 border-emerald-500 pl-4 py-2">
              <div className="flex items-center gap-3 mb-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Двухфакторная аутентификация (2FA)
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Добавьте дополнительный уровень защиты к вашему аккаунту
              </p>
              
              <TwoFactorSettings 
                userId={user.id}
                email={user.email}
                twoFactorEnabled={user.two_factor_enabled || false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
