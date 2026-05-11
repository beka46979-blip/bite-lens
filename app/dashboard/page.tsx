import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { LogoutButton } from './LogoutButton';
import Link from 'next/link';
import { User, Target, Activity, TrendingDown, TrendingUp } from 'lucide-react';

export default async function DashboardPage() {
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
      weight_start: true,
      weight_goal: true,
      daily_kcal_target: true,
      onboarding_completed: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  // Если профиль не заполнен, перенаправляем на страницу профиля
  if (!user.onboarding_completed) {
    redirect('/profile');
  }

  // Конвертируем Decimal в number
  const weightStart = user.weight_start ? Number(user.weight_start) : 0;
  const weightGoal = user.weight_goal ? Number(user.weight_goal) : 0;
  const weightDiff = weightStart - weightGoal;
  const goalType = weightDiff > 0 ? 'lose' : weightDiff < 0 ? 'gain' : 'maintain';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-emerald-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              {user.avatar ? (
                <div className="relative flex-shrink-0">
                  <img 
                    src={user.avatar} 
                    alt={user.name || 'User'} 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-emerald-500/20"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent truncate">
                  {user.name ? `Привет, ${user.name}!` : 'Добро пожаловать!'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Link
                href="/profile"
                className="px-3 sm:px-4 py-2 text-sm sm:text-base text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all hover:scale-105"
              >
                <span className="hidden sm:inline">Профиль</span>
                <User className="w-5 h-5 sm:hidden" />
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Кнопка сканирования еды */}
        <div className="mb-8 sm:mb-10">
          <Link
            href="/scan-food"
            className="group block w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden"
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/25 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 sm:w-9 sm:h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-1.5">Добавить прием пищи</h3>
                  <p className="text-white/90 text-sm sm:text-base truncate">Сфотографируйте еду для анализа калорий</p>
                </div>
              </div>
              <svg className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Текущий вес */}
          <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl p-5 sm:p-6 transition-all duration-300 hover:scale-105 border border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-transform duration-300">
                <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Текущий вес</p>
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent truncate">
                  {weightStart ? `${weightStart.toFixed(1)} кг` : 'Не указан'}
                </p>
              </div>
            </div>
          </div>

          {/* Целевой вес */}
          <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl p-5 sm:p-6 transition-all duration-300 hover:scale-105 border border-emerald-100 dark:border-emerald-900/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-transform duration-300">
                <Target className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Целевой вес</p>
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 dark:from-emerald-400 dark:to-emerald-600 bg-clip-text text-transparent truncate">
                  {weightGoal ? `${weightGoal.toFixed(1)} кг` : 'Не указан'}
                </p>
              </div>
            </div>
          </div>

          {/* Разница */}
          <div className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl p-5 sm:p-6 sm:col-span-2 lg:col-span-1 transition-all duration-300 hover:scale-105 border ${
            goalType === 'lose' 
              ? 'border-orange-100 dark:border-orange-900/30' 
              : goalType === 'gain'
              ? 'border-purple-100 dark:border-purple-900/30'
              : 'border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-transform duration-300 ${
                goalType === 'lose' 
                  ? 'bg-gradient-to-br from-orange-400 to-orange-600' 
                  : goalType === 'gain'
                  ? 'bg-gradient-to-br from-purple-400 to-purple-600'
                  : 'bg-gradient-to-br from-gray-400 to-gray-600'
              }`}>
                {goalType === 'lose' ? (
                  <TrendingDown className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                ) : goalType === 'gain' ? (
                  <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                ) : (
                  <Target className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
                  {goalType === 'lose' ? 'Нужно сбросить' : goalType === 'gain' ? 'Нужно набрать' : 'Поддержание'}
                </p>
                <p className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent truncate ${
                  goalType === 'lose' 
                    ? 'from-orange-600 to-orange-800 dark:from-orange-400 dark:to-orange-600' 
                    : goalType === 'gain'
                    ? 'from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-600'
                    : 'from-gray-600 to-gray-800 dark:from-gray-400 dark:to-gray-600'
                }`}>
                  {Math.abs(weightDiff).toFixed(1)} кг
                </p>
              </div>
            </div>
          </div>

          {/* Дневная норма калорий */}
          <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 text-white sm:col-span-2 lg:col-span-3 overflow-hidden group">
            {/* Animated background circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative flex items-center justify-between gap-6">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-white/80" />
                  <p className="text-sm sm:text-base text-white/90 font-medium">Ваша дневная норма калорий</p>
                </div>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 truncate">
                  {user.daily_kcal_target ? `${user.daily_kcal_target} ккал` : 'Не рассчитана'}
                </p>
                <p className="text-sm sm:text-base text-white/80">
                  Основано на вашем профиле и уровне активности
                </p>
              </div>
              <div className="hidden sm:flex flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                  <Activity className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Информационный блок */}
        <div className="mt-8 sm:mt-10 bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-3 sm:mb-4">
            Начните отслеживать свое питание
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Bite Lens поможет вам достичь ваших целей по весу через умный анализ питания и персонализированные рекомендации.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/scan-food"
              className="group px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm sm:text-base flex items-center justify-center gap-2 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Добавить прием пищи
            </Link>
            <Link
              href="/meal-history"
              className="px-6 sm:px-8 py-3 sm:py-3.5 border-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-sm sm:text-base hover:scale-105 hover:border-emerald-300 dark:hover:border-emerald-700 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Посмотреть историю
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
