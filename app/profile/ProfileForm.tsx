'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Locale } from '@/app/i18n';
import {
  User,
  Calendar,
  Activity,
  Target,
  Loader2,
  UserCircle2,
  Users,
  Ruler,
  Weight,
  Dumbbell,
  TrendingDown,
  TrendingUp,
  Minus,
  Briefcase,
  Armchair,
  PersonStanding,
  Footprints,
  Flame,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '@/app/components/Modal';
import { CustomSelect } from './CustomSelect';
import { WheelPicker } from './WheelPicker';

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

// Section component
function Section({
  number,
  title,
  description,
  icon: Icon,
  iconColor = 'text-emerald-500',
  iconBg = 'bg-emerald-50 dark:bg-emerald-950/30',
  extra,
  children,
}: {
  number: number;
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  iconBg?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-gray-200 dark:border-gray-800 last:border-b-0 py-8 first:pt-0 last:pb-0">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
            >
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                  {number}
                </span>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
              </div>
            </div>
          </div>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 lg:pr-8">
              {description}
            </p>
          )}
          {extra && <div className="mt-4">{extra}</div>}
        </div>
        <div className="lg:col-span-2 space-y-5">{children}</div>
      </div>
    </section>
  );
}

// Tip card (decorative)
function TipCard({
  icon: Icon,
  title,
  description,
  color = 'emerald',
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color?: 'emerald' | 'blue' | 'orange' | 'purple';
}) {
  const colors = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400',
    orange: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/40 text-orange-600 dark:text-orange-400',
    purple: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/40 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className={`p-4 rounded-xl border ${colors[color]}`}>
      <div className="flex items-start gap-3">
        <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-xs font-semibold mb-1">{title}</p>
          <p className="text-xs leading-relaxed opacity-80">{description}</p>
        </div>
      </div>
    </div>
  );
}

// Field component
function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{hint}</p>}
    </div>
  );
}

const inputClass =
  'w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10 outline-none';

export function ProfileForm({ user, locale }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    type: 'warning' as 'error' | 'warning' | 'info',
  });
  const [formData, setFormData] = useState({
    name: user.name || '',
    gender: user.gender || 'MALE',
    birthDay: user.birthDate ? new Date(user.birthDate).getDate().toString() : '',
    birthMonth: user.birthDate ? (new Date(user.birthDate).getMonth() + 1).toString() : '',
    birthYear: user.birthDate ? new Date(user.birthDate).getFullYear().toString() : '',
    heightCm: user.heightCm || '',
    weightStart: user.weightStart || '',
    weightGoal: user.weightGoal || '',
    activityLevel: user.activityLevel || 3,
    professionId: user.professionId || '',
    goalType: user.goalType || 'MAINTAIN_WEIGHT',
    weeklyTrainings: user.weeklyTrainings || 0,
  });

  const showErrorModal = (title: string, message: string) => {
    setModalConfig({ title, message, type: 'warning' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      showErrorModal('Заполните имя', 'Пожалуйста, введите ваше имя.');
      return;
    }
    if (!formData.birthDay || !formData.birthMonth || !formData.birthYear) {
      showErrorModal('Укажите дату рождения', 'Выберите день, месяц и год рождения.');
      return;
    }
    const birthYearNum = parseInt(formData.birthYear);
    const currentYear = new Date().getFullYear();
    if (birthYearNum < 1900 || birthYearNum > currentYear) {
      showErrorModal('Проверьте год рождения', `Год должен быть между 1900 и ${currentYear}.`);
      return;
    }
    const birthDateCheck = new Date(
      birthYearNum,
      parseInt(formData.birthMonth) - 1,
      parseInt(formData.birthDay)
    );
    if (birthDateCheck.getDate() !== parseInt(formData.birthDay)) {
      showErrorModal('Некорректная дата', 'Такой даты не существует. Проверьте день и месяц.');
      return;
    }
    if (!formData.heightCm || Number(formData.heightCm) < 100 || Number(formData.heightCm) > 250) {
      showErrorModal('Проверьте рост', 'Рост должен быть от 100 до 250 см.');
      return;
    }
    if (
      !formData.weightStart ||
      Number(formData.weightStart) < 30 ||
      Number(formData.weightStart) > 300
    ) {
      showErrorModal('Проверьте текущий вес', 'Вес должен быть от 30 до 300 кг.');
      return;
    }
    if (
      !formData.weightGoal ||
      Number(formData.weightGoal) < 30 ||
      Number(formData.weightGoal) > 300
    ) {
      showErrorModal('Проверьте целевой вес', 'Вес должен быть от 30 до 300 кг.');
      return;
    }
    if (!formData.activityLevel) {
      showErrorModal('Выберите уровень активности', 'Это поле обязательно.');
      return;
    }

    setIsLoading(true);

    try {
      const birthDate = `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`;

      const { birthDay, birthMonth, birthYear, ...restData } = formData;

      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...restData,
          birthDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ошибка при обновлении профиля');
        showErrorModal('Ошибка сохранения', data.error || 'Попробуйте ещё раз.');
        setIsLoading(false);
        return;
      }

      router.refresh();

      setModalConfig({
        title: 'Профиль сохранён',
        message: 'Ваши данные успешно обновлены.',
        type: 'info',
      });
      setShowModal(true);

      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } catch (err) {
      setError('Ошибка сервера');
      showErrorModal(
        'Ошибка сервера',
        'Не удалось подключиться к серверу. Проверьте интернет-соединение.'
      );
      setIsLoading(false);
    }
  };

  const currentW = Number(formData.weightStart) || 0;
  const goalW = Number(formData.weightGoal) || 0;
  const weightDiff = currentW && goalW ? Math.abs(currentW - goalW) : 0;
  const goalDirection: 'lose' | 'gain' | 'maintain' | null =
    !currentW || !goalW
      ? null
      : currentW > goalW
      ? 'lose'
      : currentW < goalW
      ? 'gain'
      : 'maintain';

  return (
    <>
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* SECTION 1: Личная информация */}
        <Section
          number={1}
          title="Личная информация"
          description="Основные данные, которые помогут точнее рассчитать дневную норму калорий"
          icon={User}
          iconColor="text-blue-500"
          iconBg="bg-blue-50 dark:bg-blue-950/30"
          extra={
            <TipCard
              icon={Calendar}
              title="Возраст имеет значение"
              description="С возрастом метаболизм замедляется. Это учитывается при расчёте дневной нормы."
              color="blue"
            />
          }
        >
          <Field label="Имя" required>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClass}
              placeholder="Например, Макс"
            />
          </Field>

          <Field label="Пол" required>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'MALE', label: 'Мужской', icon: User, color: 'text-blue-500' },
                { value: 'FEMALE', label: 'Женский', icon: UserCircle2, color: 'text-pink-500' },
                { value: 'OTHER', label: 'Другой', icon: Users, color: 'text-purple-500' },
              ].map((option) => {
                const Icon = option.icon;
                const isActive = formData.gender === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: option.value as any })}
                    className={`relative px-3 py-3 rounded-lg border text-center ${
                      isActive
                        ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white dark:text-gray-900" />
                      </div>
                    )}
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${option.color}`} />
                    <div className="text-xs font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Дата рождения" required hint={`Год: 1900 – ${new Date().getFullYear()}`}>
            <div className="grid grid-cols-3 gap-2">
              <CustomSelect
                value={formData.birthDay}
                onChange={(value) => setFormData({ ...formData, birthDay: value })}
                options={[
                  { value: '', label: 'День' },
                  ...Array.from({ length: 31 }, (_, i) => ({
                    value: String(i + 1),
                    label: String(i + 1),
                  })),
                ]}
                placeholder="День"
                label="День"
                maxVisibleItems={3}
              />
              <CustomSelect
                value={formData.birthMonth}
                onChange={(value) => setFormData({ ...formData, birthMonth: value })}
                options={[
                  { value: '', label: 'Месяц' },
                  ...['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'].map((month, index) => ({
                    value: String(index + 1),
                    label: month,
                  })),
                ]}
                placeholder="Месяц"
                label="Месяц"
                maxVisibleItems={3}
              />
              <CustomSelect
                value={formData.birthYear}
                onChange={(value) => setFormData({ ...formData, birthYear: value })}
                options={[
                  { value: '', label: 'Год' },
                  ...Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return { value: String(year), label: String(year) };
                  }),
                ]}
                placeholder="Год"
                label="Год"
                maxVisibleItems={3}
              />
            </div>
          </Field>
        </Section>

        {/* SECTION 2: Физические параметры */}
        <Section
          number={2}
          title="Физические параметры"
          description="Используются для расчёта BMR (базального метаболизма) и дневной нормы калорий"
          icon={Activity}
          iconColor="text-purple-500"
          iconBg="bg-purple-50 dark:bg-purple-950/30"
          extra={
            <TipCard
              icon={Target}
              title="Реалистичная цель"
              description="Безопасный темп — 0.5-1 кг в неделю. Слишком быстрая потеря веса вредна для здоровья."
              color="purple"
            />
          }
        >
          {/* Рост */}
          <Field label="Рост" required hint="Прокрутите колёсико или используйте стрелки. Диапазон: 100 – 250 см">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <WheelPicker
                min={100}
                max={250}
                value={Number(formData.heightCm) || 170}
                onChange={(value) => setFormData({ ...formData, heightCm: value })}
                unit="см"
              />
            </div>
          </Field>

          {/* Текущий и целевой вес — двумя колёсиками рядом */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Текущий вес" required hint="30 – 300 кг">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <WheelPicker
                  min={30}
                  max={300}
                  value={Number(formData.weightStart) || 70}
                  onChange={(value) => setFormData({ ...formData, weightStart: value })}
                  unit="кг"
                />
              </div>
            </Field>

            <Field label="Целевой вес" required hint="К чему вы стремитесь">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-emerald-200 dark:border-emerald-900/40 p-4">
                <WheelPicker
                  min={30}
                  max={300}
                  value={Number(formData.weightGoal) || 65}
                  onChange={(value) => setFormData({ ...formData, weightGoal: value })}
                  unit="кг"
                />
              </div>
            </Field>
          </div>

          {/* Goal indicator */}
          {goalDirection && (
            <div
              className={`flex items-center gap-3 p-4 rounded-xl border ${
                goalDirection === 'lose'
                  ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/40'
                  : goalDirection === 'gain'
                  ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  goalDirection === 'lose'
                    ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'
                    : goalDirection === 'gain'
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {goalDirection === 'lose' ? (
                  <TrendingDown className="w-4 h-4" />
                ) : goalDirection === 'gain' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Расчёт цели</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {goalDirection === 'lose' && `Сбросить ${weightDiff.toFixed(1)} кг`}
                  {goalDirection === 'gain' && `Набрать ${weightDiff.toFixed(1)} кг`}
                  {goalDirection === 'maintain' && 'Поддержание текущего веса'}
                </p>
              </div>
            </div>
          )}
        </Section>

        {/* SECTION 3: Активность */}
        <Section
          number={3}
          title="Активность"
          description="Уровень повседневной активности влияет на дневную норму калорий"
          icon={Flame}
          iconColor="text-orange-500"
          iconBg="bg-orange-50 dark:bg-orange-950/30"
          extra={
            <TipCard
              icon={Dumbbell}
              title="Точный расчёт"
              description="Чем активнее ваша жизнь, тем больше калорий нужно для поддержания веса. Будьте честны с собой."
              color="orange"
            />
          }
        >
          <Field label="Уровень активности">
            <div className="space-y-2">
              {[
                {
                  value: 1,
                  label: 'Минимальная',
                  desc: 'Сидячий образ жизни, мало движения',
                  icon: Armchair,
                  color: 'text-gray-500',
                },
                {
                  value: 2,
                  label: 'Низкая',
                  desc: 'Лёгкие упражнения 1-3 раза в неделю',
                  icon: PersonStanding,
                  color: 'text-blue-500',
                },
                {
                  value: 3,
                  label: 'Средняя',
                  desc: 'Умеренные тренировки 3-5 раз в неделю',
                  icon: Footprints,
                  color: 'text-emerald-500',
                },
                {
                  value: 4,
                  label: 'Высокая',
                  desc: 'Интенсивные тренировки 6-7 раз в неделю',
                  icon: Dumbbell,
                  color: 'text-orange-500',
                },
                {
                  value: 5,
                  label: 'Очень высокая',
                  desc: 'Ежедневные интенсивные тренировки',
                  icon: Flame,
                  color: 'text-red-500',
                },
              ].map((option) => {
                const Icon = option.icon;
                const isActive = formData.activityLevel === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, activityLevel: option.value })}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg border ${
                      isActive
                        ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive ? 'bg-white dark:bg-gray-900' : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${option.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {option.desc}
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isActive
                          ? 'bg-gray-900 dark:bg-white'
                          : 'border-2 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {isActive && <Check className="w-2.5 h-2.5 text-white dark:text-gray-900" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field
            label="Тренировок в неделю"
            hint="0 – 7. Влияет на расчёт дневной нормы."
          >
            <div className="relative">
              <Dumbbell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="number"
                min="0"
                max="7"
                value={formData.weeklyTrainings}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weeklyTrainings: parseInt(e.target.value) || 0,
                  })
                }
                className={`${inputClass} pl-10`}
                placeholder="0"
              />
            </div>
          </Field>
        </Section>

        {/* SECTION 4: Цели */}
        <Section
          number={4}
          title="Цели"
          description="Что вы хотите достичь? Это влияет на план питания и рекомендации"
          icon={Target}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-50 dark:bg-emerald-950/30"
          extra={
            <TipCard
              icon={TrendingUp}
              title="AI-рекомендации"
              description="На основе ваших целей мы подберём дневную норму калорий и БЖУ для оптимального результата."
              color="emerald"
            />
          }
        >
          <Field label="Ваша цель">
            <div className="space-y-2">
              {[
                {
                  value: 'LOSE_WEIGHT',
                  label: 'Похудение',
                  desc: 'Снижение веса и жировой массы',
                  icon: TrendingDown,
                  color: 'text-orange-500',
                },
                {
                  value: 'GAIN_WEIGHT',
                  label: 'Набор массы',
                  desc: 'Увеличение веса и мышечной массы',
                  icon: TrendingUp,
                  color: 'text-blue-500',
                },
                {
                  value: 'MAINTAIN_WEIGHT',
                  label: 'Поддержание',
                  desc: 'Сохранение текущего веса и формы',
                  icon: Minus,
                  color: 'text-emerald-500',
                },
              ].map((option) => {
                const Icon = option.icon;
                const isActive = formData.goalType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, goalType: option.value as any })}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg border ${
                      isActive
                        ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive ? 'bg-white dark:bg-gray-900' : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${option.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {option.desc}
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isActive
                          ? 'bg-gray-900 dark:bg-white'
                          : 'border-2 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {isActive && <Check className="w-2.5 h-2.5 text-white dark:text-gray-900" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field
            label="Профессия / род деятельности"
            hint="Учитывается в общем расчёте активности"
          >
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <select
                value={formData.professionId}
                onChange={(e) => setFormData({ ...formData, professionId: e.target.value })}
                className={`${inputClass} pl-10 appearance-none pr-10`}
              >
                <option value="">Выберите профессию</option>
                <option value="sedentary">Офисная работа (программист, бухгалтер)</option>
                <option value="light">Лёгкая активность (учитель, продавец)</option>
                <option value="moderate">Умеренная активность (медсестра, официант)</option>
                <option value="active">Активная работа (курьер, почтальон)</option>
                <option value="very_active">Очень активная (строитель, грузчик)</option>
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </Field>
        </Section>

        {/* Sticky Submit Bar */}
        <div className="sticky bottom-0 -mx-5 sm:-mx-8 mt-8 px-5 sm:px-8 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Сохранить изменения
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
