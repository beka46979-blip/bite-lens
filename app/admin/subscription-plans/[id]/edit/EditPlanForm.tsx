'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, DollarSign, Zap, TrendingUp, Settings } from 'lucide-react';

interface Plan {
  id: string;
  plan_type: string;
  name_ru: string;
  name_en: string;
  name_kg: string;
  description_ru: string;
  description_en: string;
  description_kg: string;
  price_monthly: any;
  price_yearly: any;
  currency: string;
  daily_ai_analysis_limit: number | null;
  has_gamification: boolean;
  has_advanced_analytics: boolean;
  has_meal_planning: boolean;
  has_priority_support: boolean;
  is_active: boolean;
  sort_order: number;
}

interface Props {
  plan: Plan;
}

export function EditPlanForm({ plan }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    nameRu: plan.name_ru,
    nameEn: plan.name_en,
    nameKg: plan.name_kg,
    descriptionRu: plan.description_ru,
    descriptionEn: plan.description_en,
    descriptionKg: plan.description_kg,
    priceMonthly: Number(plan.price_monthly),
    priceYearly: Number(plan.price_yearly),
    currency: plan.currency,
    dailyAiAnalysisLimit: plan.daily_ai_analysis_limit,
    hasGamification: plan.has_gamification,
    hasAdvancedAnalytics: plan.has_advanced_analytics,
    hasMealPlanning: plan.has_meal_planning,
    hasPrioritySupport: plan.has_priority_support,
    isActive: plan.is_active,
    sortOrder: plan.sort_order,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/subscription-plans/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Ошибка при сохранении');
      }

      setSuccess('План успешно обновлен!');
      
      setTimeout(() => {
        router.push('/admin/subscription-plans');
        router.refresh();
      }, 1500);
    } catch (err) {
      setError('Ошибка при сохранении плана');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Названия */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Названия плана</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название (RU)
            </label>
            <input
              type="text"
              required
              value={formData.nameRu}
              onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название (EN)
            </label>
            <input
              type="text"
              required
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название (KG)
            </label>
            <input
              type="text"
              required
              value={formData.nameKg}
              onChange={(e) => setFormData({ ...formData, nameKg: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание (RU)
            </label>
            <textarea
              required
              rows={3}
              value={formData.descriptionRu}
              onChange={(e) => setFormData({ ...formData, descriptionRu: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание (EN)
            </label>
            <textarea
              required
              rows={3}
              value={formData.descriptionEn}
              onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание (KG)
            </label>
            <textarea
              required
              rows={3}
              value={formData.descriptionKg}
              onChange={(e) => setFormData({ ...formData, descriptionKg: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Цены */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Цены</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Цена за месяц ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.priceMonthly}
              onChange={(e) =>
                setFormData({ ...formData, priceMonthly: parseFloat(e.target.value) })
              }
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Цена за год ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.priceYearly}
              onChange={(e) =>
                setFormData({ ...formData, priceYearly: parseFloat(e.target.value) })
              }
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Лимиты */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Лимиты ИИ-анализа</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Количество фото в день (оставьте пустым для безлимита)
          </label>
          <input
            type="number"
            min="0"
            value={formData.dailyAiAnalysisLimit || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                dailyAiAnalysisLimit: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            placeholder="Безлимит"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
          />
          <p className="text-sm text-gray-600 mt-2">
            Пустое поле = безлимитный анализ фото
          </p>
        </div>
      </div>

      {/* Функции */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Доступные функции</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={formData.hasGamification}
              onChange={(e) =>
                setFormData({ ...formData, hasGamification: e.target.checked })
              }
              className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <div>
              <p className="font-medium text-gray-900">Геймификация</p>
              <p className="text-sm text-gray-600">Ударный режим, достижения, стрики</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={formData.hasAdvancedAnalytics}
              onChange={(e) =>
                setFormData({ ...formData, hasAdvancedAnalytics: e.target.checked })
              }
              className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <div>
              <p className="font-medium text-gray-900">Расширенная аналитика</p>
              <p className="text-sm text-gray-600">Графики, отчеты, прогнозы</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={formData.hasMealPlanning}
              onChange={(e) =>
                setFormData({ ...formData, hasMealPlanning: e.target.checked })
              }
              className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <div>
              <p className="font-medium text-gray-900">Планирование питания</p>
              <p className="text-sm text-gray-600">Составление меню, рецепты</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={formData.hasPrioritySupport}
              onChange={(e) =>
                setFormData({ ...formData, hasPrioritySupport: e.target.checked })
              }
              className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <div>
              <p className="font-medium text-gray-900">Приоритетная поддержка</p>
              <p className="text-sm text-gray-600">Быстрые ответы, персональный менеджер</p>
            </div>
          </label>
        </div>
      </div>

      {/* Порядок сортировки */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Порядок сортировки
          </label>
          <input
            type="number"
            min="0"
            value={formData.sortOrder}
            onChange={(e) =>
              setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
            }
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
          />
          <p className="text-sm text-gray-600 mt-2">
            Чем меньше число, тем выше план в списке
          </p>
        </div>
      </div>

      {/* Статус */}
      <div className="space-y-4">
        <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <div>
            <p className="font-medium text-gray-900">План активен</p>
            <p className="text-sm text-gray-600">
              Деактивируйте, чтобы скрыть план от пользователей
            </p>
          </div>
        </label>
      </div>

      {/* Кнопки */}
      <div className="flex gap-4 pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Сохранить изменения
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
