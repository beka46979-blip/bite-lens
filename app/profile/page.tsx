import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { ProfileForm } from './ProfileForm';
import { ProfileHeader } from './ProfileHeader';
import { OnboardingWizard } from './OnboardingWizard';
import { getLocaleFromCookie } from '@/app/i18n/cookies';
import Link from 'next/link';
import { LogOut } from 'lucide-react';

export default async function ProfilePage() {
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
      avatar: true,
      gender: true,
      birth_date: true,
      height_cm: true,
      weight_start: true,
      weight_goal: true,
      activity_level: true,
      daily_kcal_target: true,
      onboarding_completed: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  // Конвертируем Decimal в number для Client Component
  const userData = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    gender: user.gender,
    birthDate: user.birth_date,
    heightCm: user.height_cm ? Number(user.height_cm) : null,
    weightStart: user.weight_start ? Number(user.weight_start) : null,
    weightGoal: user.weight_goal ? Number(user.weight_goal) : null,
    activityLevel: user.activity_level,
    dailyKcalTarget: user.daily_kcal_target ? Number(user.daily_kcal_target) : null,
    onboardingCompleted: user.onboarding_completed,
  };

  const locale = await getLocaleFromCookie();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header Bar - Fixed */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-emerald-100 dark:border-gray-700 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* User Info with Avatar Upload */}
            <ProfileHeader 
              initialAvatar={userData.avatar}
              userName={userData.name || ''}
              userEmail={userData.email}
            />
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
              {userData.onboardingCompleted && (
                <Link
                  href="/dashboard"
                  className="flex-1 sm:flex-none flex items-center justify-center text-center px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105 font-semibold text-sm"
                >
                  Dashboard
                </Link>
              )}
              <Link
                href="/force-logout"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-105 font-semibold text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Выйти</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-20 sm:h-24"></div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 sm:px-8 py-8 sm:py-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {userData.onboardingCompleted ? 'Редактировать профиль' : 'Завершите настройку профиля'}
              </h1>
              <p className="text-white/90 text-base sm:text-lg">
                {userData.onboardingCompleted 
                  ? 'Обновите свои данные для более точных рекомендаций' 
                  : 'Заполните информацию для персонализации приложения'}
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6 sm:p-8 lg:p-10">
            {userData.onboardingCompleted ? (
              <ProfileForm user={userData} locale={locale} />
            ) : (
              <OnboardingWizard user={userData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
