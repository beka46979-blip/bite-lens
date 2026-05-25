import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin';
import { AdminLoginForm } from './AdminLoginForm';
import { ThemeToggle } from '@/app/components/ThemeToggle';

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();

  if (admin) {
    redirect('/admin/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-800">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Админ-панель
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Вход для администраторов
            </p>
          </div>

          <AdminLoginForm />
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          🔒 Защищено двухфакторной аутентификацией через Telegram
        </p>
      </div>
    </div>
  );
}
