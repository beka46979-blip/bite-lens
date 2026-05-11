import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Users, Settings, DollarSign, TrendingUp } from 'lucide-react';
import { DashboardCharts } from './DashboardCharts';

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect('/admin/login');
  }

  // Получаем статистику
  const usersCount = await prisma.users.count({
    where: { role: 'USER' },
  });
  const adminsCount = await prisma.users.count({
    where: { role: 'ADMIN' },
  });

  // Получаем данные регистраций за последние 7 дней
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  console.log('Fetching registrations from:', sevenDaysAgo);

  const registrationsByDay = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as count
    FROM users
    WHERE role = 'USER' AND created_at >= ${sevenDaysAgo}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  console.log('Raw registration data:', registrationsByDay);

  // Заполняем пропущенные дни нулями
  const registrationData = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    
    const dateStr = date.toISOString().split('T')[0];
    const existing = registrationsByDay.find(r => {
      const rDate = new Date(r.date);
      return rDate.toISOString().split('T')[0] === dateStr;
    });
    
    registrationData.push({
      date: dateStr,
      count: existing ? Number(existing.count) : 0,
    });
  }

  console.log('Processed registration data:', registrationData);

  // Получаем данные о доходе за последние 7 дней (пока заглушка)
  // TODO: Когда будет таблица платежей, заменить на реальные данные
  const revenueData = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    
    revenueData.push({
      date: date.toISOString().split('T')[0],
      amount: Math.floor(Math.random() * 100), // Временные данные
    });
  }

  // Подсчитываем общий доход и рост
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0);
  const totalRegistrations = registrationData.reduce((sum, item) => sum + item.count, 0);
  const growthPercentage = totalRegistrations > 0 ? '+' + Math.floor((totalRegistrations / 7) * 100) + '%' : '+0%';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-gray-600 text-xs sm:text-sm truncate">
            Добро пожаловать, {admin.email}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Статистика */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Пользователи</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{usersCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Администраторы</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{adminsCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Доход</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">${totalRevenue}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Рост</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{growthPercentage}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Графики */}
        <DashboardCharts registrations={registrationData} revenue={revenueData} />

        {/* Быстрые действия */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 sm:p-6 border border-green-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Быстрые действия
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Link
              href="/admin/subscription-plans"
              className="p-4 bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all group"
            >
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-gray-900 font-semibold mb-1 text-sm sm:text-base">Управление тарифами</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Создание и редактирование планов</p>
            </Link>

            <Link
              href="/admin/users"
              className="p-4 bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all group"
            >
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-gray-900 font-semibold mb-1 text-sm sm:text-base">Пользователи</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Просмотр и управление</p>
            </Link>

            <Link
              href="/admin/settings"
              className="p-4 bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all group sm:col-span-2 lg:col-span-1"
            >
              <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-gray-900 font-semibold mb-1 text-sm sm:text-base">Настройки</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Конфигурация системы</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
