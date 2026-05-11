import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { VerifyEmailForm } from './VerifyEmailForm';

export default async function VerifyEmailPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  const user = await prisma.users.findUnique({
    where: { id: currentUser.userId },
    select: {
      email: true,
      is_email_verified: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  // Если email уже подтвержден, перенаправляем в профиль
  if (user.is_email_verified) {
    redirect('/profile');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-4">
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Подтвердите Email
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Мы отправим код подтверждения на
            </p>
            <p className="text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              {user.email}
            </p>
          </div>

          <VerifyEmailForm email={user.email} />
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Не получили код?{' '}
          <span className="text-emerald-600 dark:text-emerald-400">
            Проверьте папку "Спам"
          </span>
        </p>
      </div>
    </div>
  );
}
