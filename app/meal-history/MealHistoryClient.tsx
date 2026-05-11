'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Calendar, Loader2, ChevronLeft, ChevronRight, Utensils } from 'lucide-react';

interface Meal {
  id: string;
  imageUrl: string;
  dishName: string | null;
  calories: number | null;
  proteins: number | null;
  fats: number | null;
  carbs: number | null;
  weightGram: number | null;
  aiVerdict: string | null;
  confidenceScore: number | null;
  createdAt: string;
  mealType: string | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const mealTypeLabels: Record<string, { label: string; icon: string; color: string }> = {
  BREAKFAST: { label: 'Завтрак', icon: '🌅', color: 'from-yellow-400 to-orange-500' },
  LUNCH: { label: 'Обед', icon: '☀️', color: 'from-orange-400 to-red-500' },
  DINNER: { label: 'Ужин', icon: '🌙', color: 'from-purple-400 to-indigo-500' },
  SNACK: { label: 'Перекус', icon: '🍎', color: 'from-green-400 to-teal-500' },
};

export function MealHistoryClient() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMeals = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/meals/history?page=${page}&limit=12`);
      const data = await response.json();

      if (response.ok) {
        setMeals(data.meals);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals(currentPage);
  }, [currentPage]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Сегодня, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Вчера, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  if (isLoading && meals.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Загрузка истории...</p>
        </div>
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Utensils className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          История пуста
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Начните добавлять приёмы пищи, чтобы отслеживать свой прогресс
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Всего записей</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {pagination?.total || 0}
            </p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center">
            <Utensils className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Meals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meals.map((meal) => {
          const mealTypeInfo = meal.mealType ? mealTypeLabels[meal.mealType] : null;

          return (
            <div
              key={meal.id}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:scale-105"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                <Image
                  src={meal.imageUrl}
                  alt={meal.dishName || 'Meal'}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {mealTypeInfo && (
                  <div className={`absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r ${mealTypeInfo.color} rounded-xl shadow-lg backdrop-blur-sm`}>
                    <span className="text-white font-semibold text-sm flex items-center gap-1">
                      <span>{mealTypeInfo.icon}</span>
                      {mealTypeInfo.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <Calendar className="w-4 h-4" />
                  {formatDate(meal.createdAt)}
                </div>

                {/* Dish Name */}
                {meal.dishName && (
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                    {meal.dishName}
                  </h3>
                )}

                {/* Nutrition Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Калории</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {meal.calories || 0}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">ккал</p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Белки</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {meal.proteins?.toFixed(1) || 0}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">г</p>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Жиры</p>
                    <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                      {meal.fats?.toFixed(1) || 0}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">г</p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-200 dark:border-purple-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Углеводы</p>
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {meal.carbs?.toFixed(1) || 0}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">г</p>
                  </div>
                </div>

                {/* AI Verdict */}
                {meal.aiVerdict && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">AI анализ</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {meal.aiVerdict}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
            className="p-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-md"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((page) => {
                return (
                  page === 1 ||
                  page === pagination.totalPages ||
                  Math.abs(page - currentPage) <= 1
                );
              })
              .map((page, index, array) => {
                if (index > 0 && page - array[index - 1] > 1) {
                  return (
                    <span key={`ellipsis-${page}`} className="px-2 text-gray-500">
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    disabled={isLoading}
                    className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg scale-110'
                        : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-emerald-500 dark:hover:border-emerald-600 hover:scale-105'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={currentPage === pagination.totalPages || isLoading}
            className="p-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-md"
          >
            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      )}
    </div>
  );
}
