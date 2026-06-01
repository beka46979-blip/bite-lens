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
  iconColor,
  iconBg,
  extra,
  children,
}: {
  number: number;
  title: string;
  description?: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  iconColor?: string;
  iconBg?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="profile-section py-8 first:pt-0 last:pb-0">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: iconBg || 'var(--lp-bg2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon style={{ width: 20, height: 20, color: iconColor || 'var(--lp-green)' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    background: 'var(--lp-bg2)',
                    border: '1px solid var(--lp-border)',
                    color: 'var(--lp-muted)',
                    fontSize: '10px',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {number}
                </span>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--lp-text)' }}>
                  {title}
                </h3>
              </div>
            </div>
          </div>
          {description && (
            <p style={{ fontSize: '0.875rem', color: 'var(--lp-muted)', paddingRight: '1rem' }}>
              {description}
            </p>
          )}
          {extra && <div style={{ marginTop: 16 }}>{extra}</div>}
        </div>
        <div className="lg:col-span-2 space-y-5">{children}</div>
      </div>
    </section>
  );
}

// Tip card
function TipCard({
  icon: Icon,
  title,
  description,
  color = 'emerald',
}: {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  title: string;
  description: string;
  color?: 'emerald' | 'blue' | 'orange' | 'purple';
}) {
  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    emerald: { bg: 'rgba(29,184,122,0.08)',   border: '1px solid rgba(29,184,122,0.25)',  text: 'var(--lp-green)' },
    blue:    { bg: 'rgba(59,130,246,0.08)',    border: '1px solid rgba(59,130,246,0.25)',  text: '#60a5fa' },
    orange:  { bg: 'rgba(249,115,22,0.08)',    border: '1px solid rgba(249,115,22,0.25)',  text: '#fb923c' },
    purple:  { bg: 'rgba(168,85,247,0.08)',    border: '1px solid rgba(168,85,247,0.25)',  text: '#c084fc' },
  };
  const c = colorMap[color];

  return (
    <div style={{ padding: 16, borderRadius: 12, background: c.bg, border: c.border }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Icon style={{ width: 16, height: 16, color: c.text, flexShrink: 0, marginTop: 2 }} />
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: c.text, marginBottom: 4 }}>
            {title}
          </p>
          <p style={{ fontSize: '0.75rem', lineHeight: 1.5, color: 'var(--lp-muted)' }}>
            {description}
          </p>
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
      <label
        style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--lp-muted)',
          marginBottom: 8,
        }}
      >
        {label}
        {required && <span style={{ color: '#f87171', marginLeft: 4 }}>*</span>}
      </label>
      {children}
      {hint && (
        <p style={{ fontSize: '0.75rem', color: 'var(--lp-muted)', marginTop: 6 }}>{hint}</p>
      )}
    </div>
  );
}

const inputClass = 'w-full px-4 py-2.5 rounded-lg text-sm lp-input';

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
          <div
            style={{
              marginBottom: 24,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: 16,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 12,
            }}
          >
            <AlertCircle
              style={{ width: 20, height: 20, color: '#f87171', flexShrink: 0, marginTop: 2 }}
            />
            <p style={{ fontSize: '0.875rem', color: '#f87171' }}>{error}</p>
          </div>
        )}

        {/* SECTION 1: Личная информация */}
        <Section
          number={1}
          title="Личная информация"
          description="Основные данные, которые помогут точнее рассчитать дневную норму калорий"
          icon={User}
          iconColor="#60a5fa"
          iconBg="rgba(59,130,246,0.12)"
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { value: 'MALE',   label: 'Мужской', icon: User,        color: '#60a5fa' },
                { value: 'FEMALE', label: 'Женский',  icon: UserCircle2, color: '#f472b6' },
                { value: 'OTHER',  label: 'Другой',   icon: Users,       color: '#c084fc' },
              ].map((option) => {
                const Icon = option.icon;
                const isActive = formData.gender === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: option.value as any })}
                    style={{
                      position: 'relative',
                      padding: '12px 8px',
                      borderRadius: 8,
                      textAlign: 'center',
                      border: `1px solid ${isActive ? 'var(--lp-green)' : 'var(--lp-border)'}`,
                      background: isActive ? 'var(--lp-green-soft)' : 'var(--lp-bg2)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {isActive && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: 'var(--lp-green)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check style={{ width: 10, height: 10, color: '#fff' }} />
                      </div>
                    )}
                    <Icon style={{ width: 20, height: 20, margin: '0 auto 4px', color: option.color }} />
                    <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--lp-text)' }}>
                      {option.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Дата рождения" required>
            <div className="grid grid-cols-3 gap-2">
              <CustomSelect
                value={formData.birthDay}
                onChange={(v) => setFormData({ ...formData, birthDay: v })}
                options={[
                  { value: '', label: 'День' },
                  ...Array.from({ length: 31 }, (_, i) => ({
                    value: String(i + 1),
                    label: String(i + 1),
                  })),
                ]}
                placeholder="День"
                label="День"
                maxVisibleItems={5}
                inputType="number"
                max={31}
              />
              <CustomSelect
                value={formData.birthMonth}
                onChange={(v) => setFormData({ ...formData, birthMonth: v })}
                options={[
                  { value: '', label: 'Месяц' },
                  ...['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'].map((m, i) => ({
                    value: String(i + 1),
                    label: m,
                  })),
                ]}
                placeholder="Месяц"
                label="Месяц"
                maxVisibleItems={5}
              />
              <CustomSelect
                value={formData.birthYear}
                onChange={(v) => setFormData({ ...formData, birthYear: v })}
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
          iconColor="#c084fc"
          iconBg="rgba(168,85,247,0.12)"
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
            <div
              style={{
                background: 'var(--lp-bg2)',
                border: '1px solid var(--lp-border)',
                borderRadius: 12,
                padding: 16,
              }}
            >
              <WheelPicker
                min={100}
                max={250}
                value={Number(formData.heightCm) || 170}
                onChange={(value) => setFormData({ ...formData, heightCm: value })}
                unit="см"
              />
            </div>
          </Field>

          {/* Текущий и целевой вес */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Текущий вес" required hint="30 – 300 кг">
              <div
                style={{
                  background: 'var(--lp-bg2)',
                  border: '1px solid var(--lp-border)',
                  borderRadius: 12,
                  padding: 16,
                }}
              >
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
              <div
                style={{
                  background: 'var(--lp-bg2)',
                  border: '1px solid var(--lp-green-mid)',
                  borderRadius: 12,
                  padding: 16,
                }}
              >
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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 16,
                borderRadius: 12,
                background:
                  goalDirection === 'lose' ? 'rgba(249,115,22,0.08)'
                  : goalDirection === 'gain' ? 'rgba(59,130,246,0.08)'
                  : 'var(--lp-bg2)',
                border: `1px solid ${
                  goalDirection === 'lose' ? 'rgba(249,115,22,0.25)'
                  : goalDirection === 'gain' ? 'rgba(59,130,246,0.25)'
                  : 'var(--lp-border)'}`,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  flexShrink: 0,
                  background:
                    goalDirection === 'lose' ? 'rgba(249,115,22,0.15)'
                    : goalDirection === 'gain' ? 'rgba(59,130,246,0.15)'
                    : 'var(--lp-bg3)',
                  color:
                    goalDirection === 'lose' ? '#fb923c'
                    : goalDirection === 'gain' ? '#60a5fa'
                    : 'var(--lp-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {goalDirection === 'lose' ? (
                  <TrendingDown style={{ width: 16, height: 16 }} />
                ) : goalDirection === 'gain' ? (
                  <TrendingUp style={{ width: 16, height: 16 }} />
                ) : (
                  <Minus style={{ width: 16, height: 16 }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--lp-muted)' }}>Расчёт цели</p>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--lp-text)' }}>
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
          iconColor="#fb923c"
          iconBg="rgba(249,115,22,0.12)"
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { value: 1, label: 'Минимальная',    desc: 'Сидячий образ жизни, мало движения',         icon: Armchair,       color: 'var(--lp-muted)' },
                { value: 2, label: 'Низкая',          desc: 'Лёгкие упражнения 1-3 раза в неделю',        icon: PersonStanding, color: '#60a5fa' },
                { value: 3, label: 'Средняя',         desc: 'Умеренные тренировки 3-5 раз в неделю',      icon: Footprints,     color: 'var(--lp-green)' },
                { value: 4, label: 'Высокая',         desc: 'Интенсивные тренировки 6-7 раз в неделю',    icon: Dumbbell,       color: '#fb923c' },
                { value: 5, label: 'Очень высокая',   desc: 'Ежедневные интенсивные тренировки',          icon: Flame,          color: '#f87171' },
              ].map((option) => {
                const Icon = option.icon;
                const isActive = formData.activityLevel === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, activityLevel: option.value })}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: `1px solid ${isActive ? 'var(--lp-green)' : 'var(--lp-border)'}`,
                      background: isActive ? 'var(--lp-green-soft)' : 'var(--lp-bg2)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        flexShrink: 0,
                        background: isActive ? 'rgba(29,184,122,0.2)' : 'var(--lp-bg3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon style={{ width: 16, height: 16, color: option.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--lp-text)' }}>
                        {option.label}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--lp-muted)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {option.desc}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: isActive ? 'var(--lp-green)' : 'transparent',
                        border: isActive ? 'none' : '2px solid var(--lp-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isActive && <Check style={{ width: 10, height: 10, color: '#fff' }} />}
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
            <div style={{ position: 'relative' }}>
              <Dumbbell
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 16,
                  height: 16,
                  color: 'var(--lp-muted)',
                  pointerEvents: 'none',
                }}
              />
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
          iconColor="var(--lp-green)"
          iconBg="var(--lp-green-soft)"
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { value: 'LOSE_WEIGHT',     label: 'Похудение',    desc: 'Снижение веса и жировой массы',      icon: TrendingDown, color: '#fb923c' },
                { value: 'GAIN_WEIGHT',     label: 'Набор массы',  desc: 'Увеличение веса и мышечной массы',   icon: TrendingUp,   color: '#60a5fa' },
                { value: 'MAINTAIN_WEIGHT', label: 'Поддержание',  desc: 'Сохранение текущего веса и формы',   icon: Minus,        color: 'var(--lp-green)' },
              ].map((option) => {
                const Icon = option.icon;
                const isActive = formData.goalType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, goalType: option.value as any })}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: `1px solid ${isActive ? 'var(--lp-green)' : 'var(--lp-border)'}`,
                      background: isActive ? 'var(--lp-green-soft)' : 'var(--lp-bg2)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        flexShrink: 0,
                        background: isActive ? 'rgba(29,184,122,0.2)' : 'var(--lp-bg3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon style={{ width: 16, height: 16, color: option.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--lp-text)' }}>
                        {option.label}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--lp-muted)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {option.desc}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: isActive ? 'var(--lp-green)' : 'transparent',
                        border: isActive ? 'none' : '2px solid var(--lp-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isActive && <Check style={{ width: 10, height: 10, color: '#fff' }} />}
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
            <div style={{ position: 'relative' }}>
              <Briefcase
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 16,
                  height: 16,
                  color: 'var(--lp-muted)',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              />
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
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 16,
                  height: 16,
                  color: 'var(--lp-muted)',
                  pointerEvents: 'none',
                }}
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
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            margin: '32px -32px 0',
            padding: '16px 32px',
            background: 'var(--lp-bg)',
            borderTop: '1px solid var(--lp-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--lp-muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              background: 'var(--lp-green)',
              color: '#fff',
              borderRadius: 8,
              fontSize: '0.875rem',
              fontWeight: 600,
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Check style={{ width: 16, height: 16 }} />
                Сохранить изменения
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
