'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Ruler, Weight, Target, Activity, ChevronRight, ChevronLeft, UserCircle2, Users, Armchair, PersonStanding, Footprints, Dumbbell, Flame } from 'lucide-react';
import { Modal } from '@/app/components/Modal';
import { CustomSelect } from './CustomSelect';

interface OnboardingWizardProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    gender: string | null;
    birthDate: Date | null;
    heightCm: number | null;
    weightStart: number | null;
    weightGoal: number | null;
    activityLevel: string | null;
  };
}

type Step = 1 | 2 | 3 | 4;

export function OnboardingWizard({ user }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState<{ show: boolean; type: 'error' | 'warning' | 'info'; message: string }>({
    show: false,
    type: 'info',
    message: '',
  });

  // Form data
  const [formData, setFormData] = useState({
    name: user.name || '',
    gender: user.gender || '',
    birthDay: user.birthDate ? new Date(user.birthDate).getDate().toString() : '',
    birthMonth: user.birthDate ? (new Date(user.birthDate).getMonth() + 1).toString() : '',
    birthYear: user.birthDate ? new Date(user.birthDate).getFullYear().toString() : '',
    heightCm: user.heightCm?.toString() || '',
    weightStart: user.weightStart?.toString() || '',
    weightGoal: user.weightGoal?.toString() || '',
    activityLevel: user.activityLevel || '',
  });

  const showModal = (type: 'error' | 'warning' | 'info', message: string) => {
    setModal({ show: true, type, message });
  };

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          showModal('warning', 'Пожалуйста, введите ваше имя');
          return false;
        }
        if (!formData.birthDay || !formData.birthMonth || !formData.birthYear) {
          showModal('warning', 'Пожалуйста, укажите дату рождения');
          return false;
        }
        // Валидация года рождения
        const birthYear = parseInt(formData.birthYear);
        const currentYear = new Date().getFullYear();
        if (birthYear < 1900 || birthYear > currentYear) {
          showModal('warning', `Год рождения должен быть между 1900 и ${currentYear}`);
          return false;
        }
        // Валидация корректности даты
        const birthDate = new Date(birthYear, parseInt(formData.birthMonth) - 1, parseInt(formData.birthDay));
        if (birthDate.getDate() !== parseInt(formData.birthDay)) {
          showModal('warning', 'Некорректная дата рождения');
          return false;
        }
        return true;

      case 2:
        if (!formData.heightCm || Number(formData.heightCm) < 100 || Number(formData.heightCm) > 250) {
          showModal('warning', 'Пожалуйста, введите корректный рост (100-250 см)');
          return false;
        }
        return true;

      case 3:
        if (!formData.weightStart || Number(formData.weightStart) < 30 || Number(formData.weightStart) > 300) {
          showModal('warning', 'Пожалуйста, введите корректный текущий вес (30-300 кг)');
          return false;
        }
        if (!formData.weightGoal || Number(formData.weightGoal) < 30 || Number(formData.weightGoal) > 300) {
          showModal('warning', 'Пожалуйста, введите корректный целевой вес (30-300 кг)');
          return false;
        }
        return true;

      case 4:
        if (!formData.activityLevel) {
          showModal('warning', 'Пожалуйста, выберите уровень активности');
          return false;
        }
        return true;

      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep((prev) => (prev + 1) as Step);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Формируем дату в формате YYYY-MM-DD
      const birthDate = `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`;

      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          gender: formData.gender || 'other',
          birthDate: birthDate,
          heightCm: Number(formData.heightCm),
          weightStart: Number(formData.weightStart),
          weightGoal: Number(formData.weightGoal),
          activityLevel: formData.activityLevel,
          onboardingCompleted: true,
        }),
      });

      if (response.ok) {
        showModal('info', 'Профиль успешно создан! Перенаправление...');
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1500);
      } else {
        const data = await response.json();
        showModal('error', data.error || 'Ошибка при сохранении профиля');
      }
    } catch (error) {
      showModal('error', 'Произошла ошибка при сохранении');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <User className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Личная информация
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Расскажите нам о себе
              </p>
            </div>

            {/* Имя */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Имя <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                placeholder="Введите ваше имя"
              />
            </div>

            {/* Пол */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Пол
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'male' })}
                  className={`p-2 sm:p-3 md:p-4 rounded-xl border-2 transition-all ${
                    formData.gender === 'male'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300'
                  }`}
                >
                  <User className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mx-auto mb-1 sm:mb-2 text-blue-500" />
                  <div className="font-semibold text-gray-800 dark:text-white text-[10px] xs:text-xs sm:text-sm leading-tight">
                    Мужской
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'female' })}
                  className={`p-2 sm:p-3 md:p-4 rounded-xl border-2 transition-all ${
                    formData.gender === 'female'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300'
                  }`}
                >
                  <UserCircle2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mx-auto mb-1 sm:mb-2 text-pink-500" />
                  <div className="font-semibold text-gray-800 dark:text-white text-[10px] xs:text-xs sm:text-sm leading-tight">
                    Женский
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'other' })}
                  className={`p-2 sm:p-3 md:p-4 rounded-xl border-2 transition-all ${
                    formData.gender === 'other'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300'
                  }`}
                >
                  <Users className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mx-auto mb-1 sm:mb-2 text-purple-500" />
                  <div className="font-semibold text-gray-800 dark:text-white text-[10px] xs:text-xs sm:text-sm leading-tight">
                    Не<br className="sm:hidden" /> указывать
                  </div>
                </button>
              </div>
            </div>

            {/* Дата рождения */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Дата рождения <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {/* День */}
                <CustomSelect
                  value={formData.birthDay}
                  onChange={(value) => setFormData({ ...formData, birthDay: value })}
                  options={[
                    { value: '', label: 'День' },
                    ...Array.from({ length: 31 }, (_, i) => ({
                      value: String(i + 1),
                      label: String(i + 1)
                    }))
                  ]}
                  placeholder="День"
                  label="День"
                  maxVisibleItems={3}
                />

                {/* Месяц */}
                <CustomSelect
                  value={formData.birthMonth}
                  onChange={(value) => setFormData({ ...formData, birthMonth: value })}
                  options={[
                    { value: '', label: 'Месяц' },
                    ...['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
                    ].map((month, index) => ({
                      value: String(index + 1),
                      label: month
                    }))
                  ]}
                  placeholder="Месяц"
                  label="Месяц"
                  maxVisibleItems={3}
                />

                {/* Год */}
                <CustomSelect
                  value={formData.birthYear}
                  onChange={(value) => setFormData({ ...formData, birthYear: value })}
                  options={[
                    { value: '', label: 'Год' },
                    ...Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return { value: String(year), label: String(year) };
                    })
                  ]}
                  placeholder="Год"
                  label="Год"
                  maxVisibleItems={3}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Год рождения: 1900 - {new Date().getFullYear()}
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Ruler className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Ваш рост
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Укажите ваш рост в сантиметрах
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Рост (см) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                className="w-full px-4 py-3 sm:py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-xl sm:text-2xl font-bold"
                placeholder="170"
                min="100"
                max="250"
              />
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                Введите значение от 100 до 250 см
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Weight className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Ваш вес
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Укажите текущий и целевой вес
              </p>
            </div>

            {/* Текущий вес */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Текущий вес (кг) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.weightStart}
                onChange={(e) => setFormData({ ...formData, weightStart: e.target.value })}
                className="w-full px-4 py-3 sm:py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-xl sm:text-2xl font-bold"
                placeholder="70"
                min="30"
                max="300"
                step="0.1"
              />
            </div>

            {/* Целевой вес */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Целевой вес (кг) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.weightGoal}
                onChange={(e) => setFormData({ ...formData, weightGoal: e.target.value })}
                className="w-full px-4 py-3 sm:py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-xl sm:text-2xl font-bold"
                placeholder="65"
                min="30"
                max="300"
                step="0.1"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Activity className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Уровень активности
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Выберите ваш уровень физической активности
              </p>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {[
                { value: 'sedentary', icon: Armchair, title: 'Сидячий', desc: 'Минимальная активность', color: 'text-gray-500' },
                { value: 'light', icon: PersonStanding, title: 'Легкая', desc: '1-3 раза в неделю', color: 'text-blue-500' },
                { value: 'moderate', icon: Footprints, title: 'Умеренная', desc: '3-5 раз в неделю', color: 'text-green-500' },
                { value: 'active', icon: Dumbbell, title: 'Активная', desc: '6-7 раз в неделю', color: 'text-orange-500' },
                { value: 'very_active', icon: Flame, title: 'Очень активная', desc: 'Интенсивные тренировки', color: 'text-red-500' },
              ].map((level) => {
                const IconComponent = level.icon;
                return (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, activityLevel: level.value })}
                    className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 sm:gap-4 ${
                      formData.activityLevel === level.value
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300'
                    }`}
                  >
                    <IconComponent className={`w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 ${level.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">{level.title}</div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{level.desc}</div>
                    </div>
                    {formData.activityLevel === level.value && (
                      <div className="text-emerald-500 font-bold text-lg sm:text-xl flex-shrink-0">✓</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Modal
        isOpen={modal.show}
        onClose={() => setModal({ ...modal, show: false })}
        type={modal.type}
        message={modal.message}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
              Шаг {currentStep} из 4
            </span>
            <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {Math.round((currentStep / 4) * 100)}%
            </span>
          </div>
          <div className="h-2 sm:h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-5 sm:p-8 mb-5 sm:mb-6">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pb-6">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl sm:rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 font-semibold text-sm sm:text-base"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Назад</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl sm:rounded-2xl hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 font-semibold text-sm sm:text-base"
          >
            {isSubmitting ? (
              'Сохранение...'
            ) : currentStep === 4 ? (
              <>
                Завершить
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              </>
            ) : (
              <>
                Далее
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
