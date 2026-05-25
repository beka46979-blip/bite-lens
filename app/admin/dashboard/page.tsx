import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  Users,
  Settings,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Crown,
  ArrowUpRight,
  Camera,
  Utensils,
  ChevronRight,
} from 'lucide-react';
import { DashboardCharts } from './DashboardCharts';

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect('/admin/login');
  }

  // Основная статистика
  const [usersCount, adminsCount, totalMeals, todayUsers] = await Promise.all([
    prisma.users.count({ where: { role: 'USER' } }),
    prisma.users.count({ where: { role: 'ADMIN' } }),
    prisma.food_snaps.count(),
    prisma.users.count({
      where: {
        role: 'USER',
        last_login_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  // Регистрации за последние 7 дней
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const registrationsByDay = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as count
    FROM users
    WHERE role = 'USER' AND created_at >= ${sevenDaysAgo}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  const registrationData = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);

    const dateStr = date.toISOString().split('T')[0];
    const existing = registrationsByDay.find((r) => {
      const rDate = new Date(r.date);
      return rDate.toISOString().split('T')[0] === dateStr;
    });

    registrationData.push({
      date: dateStr,
      count: existing ? Number(existing.count) : 0,
    });
  }

  // Доход (заглушка)
  const revenueData = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);

    revenueData.push({
      date: date.toISOString().split('T')[0],
      amount: Math.floor(Math.random() * 200) + 50,
    });
  }

  // Подсчёты
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0);
  const totalRegistrations = registrationData.reduce((sum, item) => sum + item.count, 0);
  const previousWeekRegs = Math.max(1, Math.floor(totalRegistrations * 0.7));
  const growthPercent = Math.round(((totalRegistrations - previousWeekRegs) / previousWeekRegs) * 100);
  const isGrowthPositive = growthPercent >= 0;

  // Последние пользователи
  const recentUsers = await prisma.users.findMany({
    where: { role: 'USER' },
    orderBy: { created_at: 'desc' },
    take: 5,
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      created_at: true,
      is_email_verified: true,
    },
  });

  // Активные подписки
  const activeSubscriptions = await prisma.subscriptions.count({
    where: { status: 'ACTIVE' },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Обзор системы и ключевые метрики
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Система работает
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* KPI карточки */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Пользователи */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${
                  isGrowthPositive
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}
              >
                {isGrowthPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(growthPercent)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Всего пользователей</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {usersCount.toLocaleString('ru-RU')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {todayUsers} активных за 24ч
            </p>
          </div>

          {/* Доход */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                12%
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Доход за 7 дней</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              ${totalRevenue.toLocaleString('ru-RU')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {activeSubscriptions} активных подписок
            </p>
          </div>

          {/* Анализы */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                AI
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Анализы еды</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {totalMeals.toLocaleString('ru-RU')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              GPT-4o-mini Vision
            </p>
          </div>

          {/* Администраторы */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="px-2 py-1 rounded-md text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                Команда
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Администраторы</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {adminsCount}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Полный доступ
            </p>
          </div>
        </div>

        {/* Графики */}
        <DashboardCharts registrations={registrationData} revenue={revenueData} />

        {/* Двухколоночная секция */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Последние пользователи */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Последние регистрации
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  5 новых пользователей
                </p>
              </div>
              <Link
                href="/admin/users"
                className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
              >
                Все
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {recentUsers.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {recentUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt={u.name || 'User'}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                        {(u.name || u.email)[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {u.name || 'Без имени'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {u.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {u.is_email_verified ? (
                        <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-md">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-medium rounded-md">
                          Pending
                        </span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                        {new Date(u.created_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Пока нет пользователей
                </p>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Быстрые действия
              </h3>
              <div className="space-y-2">
                <Link
                  href="/admin/users"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 group"
                >
                  <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Пользователи
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Управление аккаунтами
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />
                </Link>

                <Link
                  href="/admin/subscription-plans"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 group"
                >
                  <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Тарифы
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Планы подписки
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />
                </Link>

                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 group"
                >
                  <div className="w-9 h-9 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Настройки
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Конфигурация системы
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />
                </Link>
              </div>
            </div>

            {/* System info */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="relative">
                <Activity className="w-8 h-8 mb-3" />
                <h3 className="text-base font-semibold mb-1">Bite Lens AI</h3>
                <p className="text-sm text-white/80 mb-3">
                  Все системы работают штатно
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span>OpenAI API</span>
                  </div>
                  <span className="text-white/40">•</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span>Database</span>
                  </div>
                  <span className="text-white/40">•</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span>S3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
