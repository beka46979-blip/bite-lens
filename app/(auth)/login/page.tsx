import { getLocaleFromCookie } from '@/app/i18n/cookies';
import { LoginForm } from './LoginForm';
import { getTranslations } from '@/app/i18n';
import Link from 'next/link';

export default async function LoginPage() {
  const locale = await getLocaleFromCookie();
  const t = getTranslations(locale, 'auth') as any;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">B</span>
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">Bite Lens</span>
        </Link>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t.login.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t.login.subtitle}
            </p>
          </div>

          <LoginForm locale={locale} />

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {t.login.noAccount}{' '}
              <Link href="/register" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                {t.login.signUp}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
