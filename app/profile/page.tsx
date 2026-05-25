import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./ProfileForm";
import { ProfileHeader } from "./ProfileHeader";
import { OnboardingWizard } from "./OnboardingWizard";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { getLocaleFromCookie } from "@/app/i18n/cookies";
import Link from "next/link";
import { LogOut, LayoutDashboard, ArrowLeft } from "lucide-react";

export default async function ProfilePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
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
    redirect("/login");
  }

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
    dailyKcalTarget: user.daily_kcal_target
      ? Number(user.daily_kcal_target)
      : null,
    onboardingCompleted: user.onboarding_completed,
  };

  const locale = await getLocaleFromCookie();

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back button + User */}
            <div className="flex items-center gap-3 min-w-0">
              {userData.onboardingCompleted && (
                <Link
                  href="/dashboard"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              )}
              <ProfileHeader
                initialAvatar={userData.avatar}
                userName={userData.name || ""}
                userEmail={userData.email}
              />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <ThemeToggle />
              {userData.onboardingCompleted && (
                <Link
                  href="/dashboard"
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              )}
              <Link
                href="/force-logout"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Выйти</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Page heading */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {userData.onboardingCompleted ? "Профиль" : "Завершите настройку"}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
            {userData.onboardingCompleted
              ? "Управляйте своими данными для точных AI-рекомендаций"
              : "Несколько шагов и приложение подстроится под вас"}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          {userData.onboardingCompleted ? (
            <div className="p-5 sm:p-8">
              <ProfileForm user={userData} locale={locale} />
            </div>
          ) : (
            <OnboardingWizard user={userData} />
          )}
        </div>
      </main>
    </div>
  );
}
