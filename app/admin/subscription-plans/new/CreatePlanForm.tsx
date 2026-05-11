'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, DollarSign, Zap, TrendingUp, Settings } from 'lucide-react';

export function CreatePlanForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    planType: '',
    customPlanType: '',
    useCustomType: false,
    nameRu: '',
    nameEn: '',
    nameKg: '',
    descriptionRu: '',
    descriptionEn: '',
    descriptionKg: '',
    priceMonthly: 0,
    priceYearly: 0,
    currency: 'USD',
    dailyAiAnalysisLimit: null as number | null,
    hasGamification: false,
    hasAdvancedAnalytics: false,
    hasMealPlanning: false,
    hasPrioritySupport: false,
    isActive: true,
    sortOrder: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Определяем финальный тип плана
    const finalPlanType = formData.useCustomType 
      ? formData.customPlanType.trim().toUpperCase().replace(/\s+/g, '_')
      : formData.planType;

    // Валидация
    if (!finalPlanType) {
      setError('Введите или выберите тип плана');
      return;
    }

    if (formData.useCustomType && formData.customPlanType.trim().length < 2) {
      setError('Тип плана должен содержать минимум 2 символа');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/subscription-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          planType: finalPlanType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'duplicate') {
          setError('План с таким типом уже существует');
        } else {
          setError('Ошибка при создании плана');
        }
        return;
      }

      setSuccess('План успешно создан!');
      
      setTimeout(() => {
        router.push('/admin/subscription-plans');
        router.refresh();
      }, 1500);
    } catch (err) {
      setError('Ошибка при создании плана');
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

      {/* Тип плана */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Тип плана</h3>
        </div>

        {/* Переключатель: выбрать из списка или создать свой */}
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={!formData.useCustomType}
              onChange={() => setFormData({ ...formData, useCustomType: false, customPlanType: '' })}
              className="w-4 h-4 text-green-600 focus:ring-green-500"
            />
            <span className="text-gray-900">Выбрать из списка</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={formData.useCustomType}
              onChange={() => setFormData({ ...formData, useCustomType: true, planType: '' })}
              className="w-4 h-4 text-green-600 focus:ring-green-500"
            />
            <span className="text-gray-900">Создать свой тип</span>
          </label>
        </div>

        {!formData.useCustomType ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип плана *
            </label>
            <select
              required={!formData.useCustomType}
              value={formData.planType}
              onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            >
              <option value="">Выберите тип</option>
              <option value="FREE">FREE - Бесплатный</option>
              <option value="PRO">PRO - Профессиональный</option>
              <option value="PREMIUM">PREMIUM - Премиум</option>
              <option value="STARTER">STARTER - Стартовый</option>
              <option value="BUSINESS">BUSINESS - Бизнес</option>
              <option value="ENTERPRISE">ENTERPRISE - Корпоративный</option>
            </select>
            <p className="text-sm text-gray-600 mt-2">
              Выберите один из предустановленных типов
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Свой тип плана *
            </label>
            <input
              type="text"
              required={formData.useCustomType}
              value={formData.customPlanType}
              onChange={(e) => setFormData({ ...formData, customPlanType: e.target.value })}
              placeholder="Например: VIP, GOLD, SILVER"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
            <p className="text-sm text-gray-600 mt-2">
              Введите уникальное название (будет преобразовано в UPPER_CASE)
            </p>
            {formData.customPlanType && (
              <p className="text-sm text-green-600 mt-2">
                Результат: <strong>{formData.customPlanType.trim().toUpperCase().replace(/\s+/g, '_')}</strong>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Названия */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Названия плана</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название (RU) *
            </label>
            <input
              type="text"
              required
              value={formData.nameRu}
              onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              placeholder="Бесплатный"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название (EN) *
            </label>
            <input
              type="text"
              required
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              placeholder="Free"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название (KG) *
            </label>
            <input
              type="text"
              required
              value={formData.nameKg}
              onChange={(e) => setFormData({ ...formData, nameKg: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              placeholder="Акысыз"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание (RU) *
            </label>
            <textarea
              required
              rows={3}
              value={formData.descriptionRu}
              onChange={(e) => setFormData({ ...formData, descriptionRu: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              placeholder="Базовые функции..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание (EN) *
            </label>
            <textarea
              required
              rows={3}
              value={formData.descriptionEn}
              onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              placeholder="Basic features..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание (KG) *
            </label>
            <textarea
              required
              rows={3}
              value={formData.descriptionKg}
              onChange={(e) => setFormData({ ...formData, descriptionKg: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              placeholder="Негизги функциялар..."
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
              Цена за месяц ($) *
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
              Цена за год ($) *
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
              Создание...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Создать план
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
