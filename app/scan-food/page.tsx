import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { FoodScanForm } from './FoodScanForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function ScanFoodPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-emerald-100 dark:border-gray-700 shadow-sm px-4 py-5">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all hover:scale-110"
          >
            <ArrowLeft className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Сканировать еду
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Загрузите фото для анализа калорий</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 py-8">
        <FoodScanForm userId={currentUser.userId} />
      </div>
    </div>
  );
}
