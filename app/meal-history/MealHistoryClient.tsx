'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Calendar, Loader2, ChevronLeft, ChevronRight, Utensils, Search, ImageIcon, X } from 'lucide-react';
import { ImageViewerModal } from '@/app/components/ImageViewerModal';

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

  // Поиск по дате
  const [searchDate, setSearchDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Модалка просмотра изображения
  const [viewerImage, setViewerImage] = useState<{ url: string; name: string } | null>(null);

  const fetchMeals = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/meals/history?page=${page}&limit=20`);
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

  // Фильтрация по дате и названию
  const filteredMeals = useMemo(() => {
    return meals.filter((meal) => {
      // Фильтр по дате
      if (searchDate) {
        const mealDate = new Date(meal.createdAt).toISOString().split('T')[0];
        if (mealDate !== searchDate) return false;
      }

      // Фильтр по названию блюда
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const dishName = (meal.dishName || '').toLowerCase();
        if (!dishName.includes(query)) return false;
      }

      return true;
    });
  }, [meals, searchDate, searchQuery]);

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

  const clearFilters = () => {
    setSearchDate('');
    setSearchQuery('');
  };

  const hasFilters = searchDate || searchQuery;

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
      {/* Stats Summary + Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {hasFilters ? 'Найдено' : 'Всего записей'}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {hasFilters ? filteredMeals.length : pagination?.total || 0}
            </p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center">
            <Utensils className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Поисковая панель */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Поиск по дате */}
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-600 focus:outline-none"
            />
          </div>

          {/* Поиск по названию */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Поиск по названию блюда..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-emerald-500 dark:focus:border-emerald-600 focus:outline-none"
            />
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <X className="w-5 h-5" />
              Сбросить
            </button>
          )}
        </div>
      </div>

      {/* Empty filtered state */}
      {filteredMeals.length === 0 && hasFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Ничего не найдено
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Попробуйте изменить параметры поиска
          </p>
        </div>
      )}

      {/* Горизонтальный список карточек */}
      <div className="space-y-4">
        {filteredMeals.map((meal) => {
          const mealTypeInfo = meal.mealType ? mealTypeLabels[meal.mealType] : null;

          return (
            <div
              key={meal.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Кнопка просмотра фото - с размытым фоном из самого фото */}
                <button
                  onClick={() =>
                    setViewerImage({
                      url: meal.imageUrl,
                      name: meal.dishName || 'Meal',
                    })
                  }
                  className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 overflow-hidden group"
                >
                  {/* Фоновое изображение блюда (размытое) */}
                  <div
                    className="absolute inset-0 bg-cover bg-center scale-110 blur-md group-hover:blur-sm group-hover:scale-105"
                    style={{ backgroundImage: `url(${meal.imageUrl})` }}
                  />

                  {/* Затемняющий слой для читаемости текста */}
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40" />

                  {/* Контент кнопки */}
                  <div className="relative h-full flex items-center justify-center p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg border border-white/30">
                        <ImageIcon className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-white drop-shadow-lg">
                        Посмотреть фото
                      </p>
                    </div>
                  </div>

                  {/* Бейдж типа приёма пищи */}
                  {mealTypeInfo && (
                    <div
                      className={`absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r ${mealTypeInfo.color} rounded-xl shadow-lg z-10`}
                    >
                      <span className="text-white font-semibold text-sm flex items-center gap-1">
                        <span>{mealTypeInfo.icon}</span>
                        {mealTypeInfo.label}
                      </span>
                    </div>
                  )}
                </button>

                {/* Контент карточки */}
                <div className="flex-1 p-5">
                  {/* Дата и название */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(meal.createdAt)}
                    </div>
                    {meal.dishName && (
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {meal.dishName}
                      </h3>
                    )}
                    {meal.weightGram && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Вес порции: {meal.weightGram}г
                      </p>
                    )}
                  </div>

                  {/* Питательная ценность - в ряд */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
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
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">AI анализ</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {meal.aiVerdict}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination - показываем только если нет фильтра */}
      {!hasFilters && pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
            className="p-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
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
                    className={`w-10 h-10 rounded-xl font-semibold ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-emerald-500 dark:hover:border-emerald-600'
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
            className="p-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewerImage && (
        <ImageViewerModal
          isOpen={!!viewerImage}
          onClose={() => setViewerImage(null)}
          imageUrl={viewerImage.url}
          userName={viewerImage.name}
        />
      )}
    </div>
  );
}
