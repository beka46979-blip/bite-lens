'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Check, X, Infinity, Trash2, Loader2 } from 'lucide-react';
import { EditPlanModal } from './EditPlanModal';

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
  plans: Plan[];
}

export function SubscriptionPlansTable({ plans }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const handleDelete = async (planId: string) => {
    setDeletingId(planId);

    try {
      const response = await fetch(`/api/admin/subscription-plans/${planId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        alert('Ошибка при удалении плана');
        return;
      }

      router.refresh();
    } catch (error) {
      alert('Ошибка при удалении плана');
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(null);
    }
  };

  const getBadgeColor = (planType: string) => {
    switch (planType) {
      case 'FREE':
        return 'bg-gray-100 border-gray-300 text-gray-700';
      case 'PRO':
        return 'bg-blue-50 border-blue-300 text-blue-700';
      case 'PREMIUM':
        return 'bg-purple-50 border-purple-300 text-purple-700';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  return (
    <>
      <div className="overflow-x-auto touch-pan-y" style={{ overscrollBehaviorX: 'contain' }}>
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              План
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Цены
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
              Лимит ИИ
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
              Статус
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
              Действия
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {plans.map((plan) => (
            <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{plan.name_ru}</p>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border ${getBadgeColor(
                          plan.plan_type
                        )}`}
                      >
                        {plan.plan_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {plan.description_ru.substring(0, 50)}...
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-gray-900">
                  <p className="font-semibold">
                    ${Number(plan.price_monthly).toFixed(2)}/мес
                  </p>
                  <p className="text-sm text-gray-600">
                    ${Number(plan.price_yearly).toFixed(2)}/год
                  </p>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                {plan.daily_ai_analysis_limit === null ? (
                  <div className="flex items-center justify-center gap-1 text-green-600">
                    <Infinity className="w-4 h-4" />
                    <span className="text-sm font-medium">Безлимит</span>
                  </div>
                ) : (
                  <span className="text-gray-900 font-medium">
                    {plan.daily_ai_analysis_limit} фото/день
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-center">
                {plan.is_active ? (
                  <span className="px-3 py-1 bg-green-100 border border-green-300 text-green-700 rounded-full text-sm font-medium">
                    Активен
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-100 border border-red-300 text-red-700 rounded-full text-sm font-medium">
                    Неактивен
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setEditingPlan(plan)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Редактировать
                  </button>

                  {showDeleteConfirm === plan.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(plan.id)}
                        disabled={deletingId === plan.id}
                        className="inline-flex items-center justify-center w-10 h-10 bg-red-100 border border-red-300 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                        title="Подтвердить удаление"
                      >
                        {deletingId === plan.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        disabled={deletingId === plan.id}
                        className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Отмена"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(plan.id)}
                      className="inline-flex items-center justify-center w-10 h-10 bg-red-100 border border-red-300 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {plans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">Тарифные планы не найдены</p>
          <p className="text-sm text-gray-500 mt-2">
            Создайте первый план, нажав кнопку "Создать план"
          </p>
        </div>
      )}
    </div>

    {/* Modal */}
    {editingPlan && (
      <EditPlanModal
        plan={editingPlan}
        isOpen={!!editingPlan}
        onClose={() => setEditingPlan(null)}
      />
    )}
  </>
  );
}
