import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { Users, UserCheck, UserPlus, Shield } from 'lucide-react';
import { UsersTable } from './UsersTable';

async function getUserStats() {
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const today = new Date(now.setHours(0, 0, 0, 0));

    const [
      totalUsers,
      newUsersLast24h,
      activeToday,
      totalAdmins,
    ] = await Promise.all([
      prisma.users.count({
        where: { role: 'USER' },
      }),
      prisma.users.count({
        where: {
          role: 'USER',
          created_at: { gte: yesterday },
        },
      }),
      prisma.sessions.count({
        where: {
          created_at: { gte: today },
        },
      }),
      prisma.users.count({
        where: { role: 'ADMIN' },
      }),
    ]);

    return {
      totalUsers,
      newUsersLast24h,
      activeToday,
      totalAdmins,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      totalUsers: 0,
      newUsersLast24h: 0,
      activeToday: 0,
      totalAdmins: 0,
    };
  }
}

export default async function UsersPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect('/admin/login');
  }

  const stats = await getUserStats();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Управление пользователями
          </h1>
          <p className="text-gray-600 text-sm">
            Просмотр и управление учетными записями пользователей
          </p>
        </div>
      </div>

      <div className="p-8 max-w-7xl">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Всего пользователей</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Новых за 24ч</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newUsersLast24h}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Активных сегодня</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Администраторов</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAdmins}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Таблица пользователей */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <UsersTable />
        </div>
      </div>
    </div>
  );
}
