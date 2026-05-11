'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Locale } from '@/app/i18n';
import { User, Calendar, Activity, Target, Loader2 } from 'lucide-react';

interface ProfileFormProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
    birthDate: Date | null;
    heightCm: number | null;
    weightStart: number | null;
    weightGoal: number | null;
    activityLevel: number | null;
    dailyKcalTarget: number | null;
    onboardingCompleted: boolean;
    professionId?: string | null;
    goalType?: string | null;
    weeklyTrainings?: number | null;
  };
  locale: Locale;
}

export function ProfileForm({ user, locale }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: user.name || '',
    gender: user.gender || 'OTHER',
    birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
    heightCm: user.heightCm || '',
    weightStart: user.weightStart || '',
    weightGoal: user.weightGoal || '',
    activityLevel: user.activityLevel || 3,
    professionId: user.professionId || '',
    goalType: user.goalType || 'MAINTAIN_WEIGHT',
    weeklyTrainings: user.weeklyTrainings || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ошибка при обновлении профиля');
        return;
      }

      // Перезагружаем страницу чтобы обновить данные
      router.refresh();
      
      // Показываем успешное сообщение
      alert('Профиль успешно обновлен!');
    } catch (err) {
      setError('Ошибка сервера');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-l-4 border-red-500 p-4 rounded-2xl shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Личная информация */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Личная информация</h3>
        </div>

        {/* Имя */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Имя
          </label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all text-base"
              placeholder="Введите ваше имя"
            />
          </div>
        </div>

        {/* Пол */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Пол
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: 'MALE', label: 'Мужской', icon: '👨' },
              { value: 'FEMALE', label: 'Женский', icon: '👩' },
              { value: 'OTHER', label: 'Другой', icon: '🧑' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, gender: option.value as any })}
                className={`group relative py-4 px-4 rounded-xl border-2 transition-all duration-300 ${
                  formData.gender === option.value
                    ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 shadow-lg scale-105'
                    : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{option.icon}</div>
                  <div className={`font-semibold ${
                    formData.gender === option.value
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {option.label}
                  </div>
                </div>
                {formData.gender === option.value && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Дата рождения */}
        <div>
          <label htmlFor="birthDate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Дата рождения
          </label>
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              id="birthDate"
              type="date"
              required
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all text-base"
            />
          </div>
        </div>
      </div>

      {/* Физические параметры */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Физические параметры</h3>
        </div>

        {/* Рост и текущий вес */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="heightCm" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              📏 Рост (см)
            </label>
            <input
              id="heightCm"
              type="number"
              required
              min="100"
              max="250"
              value={formData.heightCm}
              onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
              className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all text-base"
              placeholder="170"
            />
          </div>

          <div>
            <label htmlFor="weightStart" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ⚖️ Текущий вес (кг)
            </label>
            <input
              id="weightStart"
              type="number"
              required
              min="30"
              max="300"
              step="0.1"
              value={formData.weightStart}
              onChange={(e) => setFormData({ ...formData, weightStart: e.target.value })}
              className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all text-base"
              placeholder="70"
            />
          </div>
        </div>

        {/* Целевой вес */}
        <div>
          <label htmlFor="weightGoal" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            🎯 Целевой вес (кг)
          </label>
          <input
            id="weightGoal"
            type="number"
            required
            min="30"
            max="300"
            step="0.1"
            value={formData.weightGoal}
            onChange={(e) => setFormData({ ...formData, weightGoal: e.target.value })}
            className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all text-base"
            placeholder="65"
          />
        </div>
      </div>

      {/* Активность и цели */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Активность и цели</h3>
        </div>

        {/* Уровень активности */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <Activity className="inline w-4 h-4 mr-1" />
            Уровень активности
          </label>
          <div className="space-y-3">
            {[
              { value: 1, label: 'Минимальная', desc: 'Сидячий образ жизни', icon: '🪑' },
              { value: 2, label: 'Низкая', desc: 'Легкие упражнения 1-3 раза в неделю', icon: '🚶' },
              { value: 3, label: 'Средняя', desc: 'Умеренные упражнения 3-5 раз в неделю', icon: '🏃' },
              { value: 4, label: 'Высокая', desc: 'Интенсивные упражнения 6-7 раз в неделю', icon: '💪' },
              { value: 5, label: 'Очень высокая', desc: 'Ежедневные интенсивные тренировки', icon: '🏋️' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, activityLevel: option.value })}
                className={`group w-full text-left py-4 px-5 rounded-xl border-2 transition-all duration-300 ${
                  formData.activityLevel === option.value
                    ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 shadow-lg'
                    : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{option.icon}</div>
                  <div className="flex-1">
                    <div className={`font-semibold text-base ${
                      formData.activityLevel === option.value
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{option.desc}</div>
                  </div>
                  {formData.activityLevel === option.value && (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Частота тренировок */}
        <div>
          <label htmlFor="weeklyTrainings" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            🏋️ Тренировки в неделю
          </label>
          <input
            id="weeklyTrainings"
            type="number"
            min="0"
            max="7"
            value={formData.weeklyTrainings}
            onChange={(e) => setFormData({ ...formData, weeklyTrainings: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all text-base"
            placeholder="0-7"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Сколько раз в неделю вы тренируетесь? (0-7)
          </p>
        </div>

        {/* Цель */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            🎯 Ваша цель
          </label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { value: 'LOSE_WEIGHT', label: 'Похудение', desc: 'Снижение веса', icon: '📉', color: 'orange' },
              { value: 'GAIN_WEIGHT', label: 'Набор массы', desc: 'Увеличение веса и мышечной массы', icon: '📈', color: 'blue' },
              { value: 'MAINTAIN_WEIGHT', label: 'Поддержание', desc: 'Сохранение текущего веса', icon: '⚖️', color: 'green' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, goalType: option.value as any })}
                className={`group text-left py-4 px-5 rounded-xl border-2 transition-all duration-300 ${
                  formData.goalType === option.value
                    ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 shadow-lg'
                    : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{option.icon}</div>
                  <div className="flex-1">
                    <div className={`font-semibold text-base ${
                      formData.goalType === option.value
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{option.desc}</div>
                  </div>
                  {formData.goalType === option.value && (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Профессия */}
        <div>
          <label htmlFor="professionId" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            💼 Профессия / Род деятельности
          </label>
          <select
            id="professionId"
            value={formData.professionId}
            onChange={(e) => setFormData({ ...formData, professionId: e.target.value })}
            className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all text-base"
          >
            <option value="">Выберите профессию</option>
            <option value="sedentary">🖥️ Офисная работа (программист, бухгалтер)</option>
            <option value="light">👨‍🏫 Легкая активность (учитель, продавец)</option>
            <option value="moderate">👩‍⚕️ Умеренная активность (медсестра, официант)</option>
            <option value="active">🚴 Активная работа (курьер, почтальон)</option>
            <option value="very_active">🏗️ Очень активная (строитель, грузчик)</option>
          </select>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Влияет на расчет дневной нормы калорий
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:scale-[1.02]"
        >
          {isLoading && <Loader2 className="w-6 h-6 animate-spin" />}
          {user.onboardingCompleted ? '💾 Сохранить изменения' : '✨ Сохранить профиль'}
        </button>
      </div>
    </form>
  );
}
