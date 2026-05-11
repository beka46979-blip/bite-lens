'use client';

import { Plus, DollarSign, Zap, TrendingUp } from 'lucide-react';
import { SubscriptionPlansTable } from './SubscriptionPlansTable';
import { CreatePlanModal } from './CreatePlanModal';
import { useState } from 'react';

interface Plan {
  id: string;
  plan_type: string;
  name_ru: string;
  name_en: string;
  name_kg: string;
  description_ru: string;
  description_en: string;
  description_kg: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  daily_ai_analysis_limit: number | null;
  has_gamification: boolean;
  has_advanced_analytics: boolean;
  has_meal_planning: boolean;
  has_priority_support: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface SubscriptionPlansClientProps {
  plans: Plan[];
}

export function SubscriptionPlansClient({ plans }: SubscriptionPlansClientProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
    window.location.reload(); // Перезагружаем страницу для обновления данных
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Управление тарифными планами
            </h1>
            <p className="text-gray-600 text-sm">
              Настройка цен, лимитов и функций подписок
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Создать план
          </button>
        </div>
      </div>

      <div className="p-8 max-w-7xl">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Всего планов</p>
                <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Активных</p>
                <p className="text-2xl font-bold text-gray-900">
                  {plans.filter(p => p.is_active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Средняя цена</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${plans.length > 0 ? (plans.reduce((sum, p) => sum + Number(p.price_monthly), 0) / plans.length).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Таблица планов */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <SubscriptionPlansTable plans={plans} key={refreshKey} />
        </div>
      </div>

      {/* Create Modal */}
      <CreatePlanModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
