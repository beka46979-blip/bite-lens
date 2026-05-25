"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Ruler,
  Weight,
  Activity,
  ChevronRight,
  ChevronLeft,
  UserCircle2,
  Users,
  Armchair,
  PersonStanding,
  Footprints,
  Dumbbell,
  Flame,
  Check,
  Loader2,
} from "lucide-react";
import { Modal } from "@/app/components/Modal";
import { CustomSelect } from "./CustomSelect";
import { WheelPicker } from "./WheelPicker";

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
    activityLevel: number | null;
  };
}

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { id: 1, label: "О вас", icon: User },
  { id: 2, label: "Рост", icon: Ruler },
  { id: 3, label: "Вес", icon: Weight },
  { id: 4, label: "Активность", icon: Activity },
];

export function OnboardingWizard({ user }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState<{
    show: boolean;
    type: "error" | "warning" | "info";
    message: string;
  }>({
    show: false,
    type: "info",
    message: "",
  });

  const [formData, setFormData] = useState({
    name: user.name || "",
    gender: user.gender || "",
    birthDay: user.birthDate
      ? new Date(user.birthDate).getDate().toString()
      : "",
    birthMonth: user.birthDate
      ? (new Date(user.birthDate).getMonth() + 1).toString()
      : "",
    birthYear: user.birthDate
      ? new Date(user.birthDate).getFullYear().toString()
      : "",
    heightCm: user.heightCm?.toString() || "",
    weightStart: user.weightStart?.toString() || "",
    weightGoal: user.weightGoal?.toString() || "",
    activityLevel: user.activityLevel || "",
  });

  const showModal = (type: "error" | "warning" | "info", message: string) => {
    setModal({ show: true, type, message });
  };

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          showModal("warning", "Пожалуйста, введите ваше имя");
          return false;
        }
        if (!formData.birthDay || !formData.birthMonth || !formData.birthYear) {
          showModal("warning", "Пожалуйста, укажите дату рождения");
          return false;
        }
        const birthYear = parseInt(formData.birthYear);
        const currentYear = new Date().getFullYear();
        if (birthYear < 1900 || birthYear > currentYear) {
          showModal(
            "warning",
            `Год рождения должен быть между 1900 и ${currentYear}`,
          );
          return false;
        }
        const birthDate = new Date(
          birthYear,
          parseInt(formData.birthMonth) - 1,
          parseInt(formData.birthDay),
        );
        if (birthDate.getDate() !== parseInt(formData.birthDay)) {
          showModal("warning", "Некорректная дата рождения");
          return false;
        }
        return true;

      case 2:
        if (
          !formData.heightCm ||
          Number(formData.heightCm) < 100 ||
          Number(formData.heightCm) > 250
        ) {
          showModal(
            "warning",
            "Пожалуйста, введите корректный рост (100-250 см)",
          );
          return false;
        }
        return true;

      case 3:
        if (
          !formData.weightStart ||
          Number(formData.weightStart) < 30 ||
          Number(formData.weightStart) > 300
        ) {
          showModal(
            "warning",
            "Пожалуйста, введите корректный текущий вес (30-300 кг)",
          );
          return false;
        }
        if (
          !formData.weightGoal ||
          Number(formData.weightGoal) < 30 ||
          Number(formData.weightGoal) > 300
        ) {
          showModal(
            "warning",
            "Пожалуйста, введите корректный целевой вес (30-300 кг)",
          );
          return false;
        }
        return true;

      case 4:
        if (!formData.activityLevel) {
          showModal("warning", "Пожалуйста, выберите уровень активности");
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
      const birthDate = `${formData.birthYear}-${formData.birthMonth.padStart(2, "0")}-${formData.birthDay.padStart(2, "0")}`;

      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          gender: formData.gender || "other",
          birthDate: birthDate,
          heightCm: Number(formData.heightCm),
          weightStart: Number(formData.weightStart),
          weightGoal: Number(formData.weightGoal),
          activityLevel: formData.activityLevel,
          onboardingCompleted: true,
        }),
      });

      if (response.ok) {
        showModal("info", "Профиль успешно создан");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1200);
      } else {
        const data = await response.json();
        showModal("error", data.error || "Ошибка при сохранении профиля");
        setIsSubmitting(false);
      }
    } catch (error) {
      showModal("error", "Произошла ошибка при сохранении");
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Имя */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Как вас зовут? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-emerald-500/10 outline-none text-gray-900 dark:text-white text-base placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="Например, Макс"
              />
            </div>

            {/* Пол */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Пол
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  {
                    value: "male",
                    label: "Мужской",
                    icon: User,
                    color: "text-blue-500",
                  },
                  {
                    value: "female",
                    label: "Женский",
                    icon: UserCircle2,
                    color: "text-pink-500",
                  },
                  {
                    value: "other",
                    label: "Не указывать",
                    icon: Users,
                    color: "text-purple-500",
                  },
                ].map((option) => {
                  const Icon = option.icon;
                  const isActive = formData.gender === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, gender: option.value })
                      }
                      className={`relative p-4 rounded-xl border text-center ${
                        isActive
                          ? "border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900"
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white dark:text-gray-900" />
                        </div>
                      )}
                      <Icon
                        className={`w-6 h-6 mx-auto mb-2 ${option.color}`}
                      />
                      <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                        {option.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Дата рождения */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Дата рождения <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {/* Вычисляем кол-во дней в выбранном месяце */}
                {(() => {
                  const month = parseInt(formData.birthMonth) || 0;
                  const year =
                    parseInt(formData.birthYear) || new Date().getFullYear();
                  const maxDays = month
                    ? new Date(year, month, 0).getDate()
                    : 31;
                  // Список дней ограничен реальным maxDays
                  const dayOptions = [
                    { value: "", label: "День" },
                    ...Array.from({ length: maxDays }, (_, i) => ({
                      value: String(i + 1),
                      label: String(i + 1),
                    })),
                  ];
                  return (
                    <CustomSelect
                      value={formData.birthDay}
                      onChange={(value) =>
                        setFormData({ ...formData, birthDay: value })
                      }
                      options={dayOptions}
                      placeholder="День"
                      label="День"
                      maxVisibleItems={3}
                      inputType="number"
                      max={maxDays}
                    />
                  );
                })()}
                <CustomSelect
                  value={formData.birthMonth}
                  onChange={(newMonth) => {
                    // Корректируем день если он превышает кол-во дней нового месяца
                    const year =
                      parseInt(formData.birthYear) || new Date().getFullYear();
                    const newMaxDays = newMonth
                      ? new Date(year, parseInt(newMonth), 0).getDate()
                      : 31;
                    const currentDay = parseInt(formData.birthDay);
                    const correctedDay =
                      currentDay > newMaxDays
                        ? String(newMaxDays)
                        : formData.birthDay;
                    setFormData({
                      ...formData,
                      birthMonth: newMonth,
                      birthDay: correctedDay,
                    });
                  }}
                  options={[
                    { value: "", label: "Месяц" },
                    ...[
                      "Январь",
                      "Февраль",
                      "Март",
                      "Апрель",
                      "Май",
                      "Июнь",
                      "Июль",
                      "Август",
                      "Сентябрь",
                      "Октябрь",
                      "Ноябрь",
                      "Декабрь",
                    ].map((month, index) => ({
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
                  onChange={(value) =>
                    setFormData({ ...formData, birthYear: value })
                  }
                  options={[
                    { value: "", label: "Год" },
                    ...Array.from(
                      { length: new Date().getFullYear() - 1900 + 1 },
                      (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return { value: String(year), label: String(year) };
                      },
                    ),
                  ]}
                  placeholder="Год"
                  label="Год"
                  maxVisibleItems={3}
                  inputType="number"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Рост
                </p>
                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                  Ваш рост в сантиметрах
                </p>
              </div>
              <div className="p-4">
                <WheelPicker
                  min={100}
                  max={250}
                  value={Number(formData.heightCm) || 170}
                  onChange={(value) =>
                    setFormData({ ...formData, heightCm: String(value) })
                  }
                  unit="см"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center flex items-center justify-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Прокрутите колёсико или нажмите на нужное значение
            </p>
          </div>
        );

      case 3:
        const currentW = Number(formData.weightStart) || 0;
        const goalW = Number(formData.weightGoal) || 0;
        const weightDiff = currentW && goalW ? Math.abs(currentW - goalW) : 0;
        const goalDirection: "lose" | "gain" | "maintain" | null =
          !currentW || !goalW
            ? null
            : currentW > goalW
              ? "lose"
              : currentW < goalW
                ? "gain"
                : "maintain";

        return (
          <div className="space-y-5">
            {/* Два колёсика в ряд */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Текущий вес */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Сейчас
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                    Текущий вес
                  </p>
                </div>
                <div className="p-3 sm:p-4">
                  <WheelPicker
                    min={30}
                    max={300}
                    value={Number(formData.weightStart) || 70}
                    onChange={(value) =>
                      setFormData({ ...formData, weightStart: String(value) })
                    }
                    unit="кг"
                  />
                </div>
              </div>

              {/* Целевой вес */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-emerald-50/50 dark:bg-emerald-900/10">
                  <p className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Цель
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                    Желаемый вес
                  </p>
                </div>
                <div className="p-3 sm:p-4">
                  <WheelPicker
                    min={30}
                    max={300}
                    value={Number(formData.weightGoal) || 65}
                    onChange={(value) =>
                      setFormData({ ...formData, weightGoal: String(value) })
                    }
                    unit="кг"
                  />
                </div>
              </div>
            </div>

            {/* Визуализация цели */}
            {goalDirection && (
              <div
                className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 ${
                  goalDirection === "lose"
                    ? "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30"
                    : goalDirection === "gain"
                      ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30"
                      : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        goalDirection === "lose"
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                          : goalDirection === "gain"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {goalDirection === "lose" ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                      ) : goalDirection === "gain" ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12h14"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Ваша цель
                      </p>
                      <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                        {goalDirection === "lose" &&
                          `Сбросить ${weightDiff.toFixed(1)} кг`}
                        {goalDirection === "gain" &&
                          `Набрать ${weightDiff.toFixed(1)} кг`}
                        {goalDirection === "maintain" && "Поддержание веса"}
                      </p>
                    </div>
                  </div>

                  {/* Прогресс полоса */}
                  <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 tabular-nums">
                      {currentW} кг
                    </span>
                    <div className="w-20 lg:w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          goalDirection === "lose"
                            ? "bg-orange-500"
                            : goalDirection === "gain"
                              ? "bg-blue-500"
                              : "bg-gray-400"
                        }`}
                        style={{ width: "50%" }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {goalW} кг
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-2">
            {[
              {
                value: "sedentary",
                icon: Armchair,
                title: "Сидячий",
                desc: "Минимальная активность, офисная работа",
                color: "text-gray-500",
              },
              {
                value: "light",
                icon: PersonStanding,
                title: "Легкая",
                desc: "Тренировки 1-3 раза в неделю",
                color: "text-blue-500",
              },
              {
                value: "moderate",
                icon: Footprints,
                title: "Умеренная",
                desc: "Тренировки 3-5 раз в неделю",
                color: "text-emerald-500",
              },
              {
                value: "active",
                icon: Dumbbell,
                title: "Активная",
                desc: "Тренировки 6-7 раз в неделю",
                color: "text-orange-500",
              },
              {
                value: "very_active",
                icon: Flame,
                title: "Очень активная",
                desc: "Интенсивные ежедневные тренировки",
                color: "text-red-500",
              },
            ].map((level) => {
              const Icon = level.icon;
              const isActive = formData.activityLevel === level.value;
              return (
                <button
                  key={level.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, activityLevel: level.value })
                  }
                  className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 ${
                    isActive
                      ? "border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isActive
                        ? "bg-white dark:bg-gray-900"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${level.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                      {level.title}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {level.desc}
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isActive
                        ? "bg-gray-900 dark:bg-white"
                        : "border-2 border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {isActive && (
                      <Check className="w-3 h-3 text-white dark:text-gray-900" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        );
    }
  };

  const currentStepInfo = STEPS.find((s) => s.id === currentStep)!;
  const StepIcon = currentStepInfo.icon;

  return (
    <>
      <Modal
        isOpen={modal.show}
        onClose={() => setModal({ ...modal, show: false })}
        type={modal.type}
        message={modal.message}
      />

      <div>
        {/* Stepper - desktop */}
        <div className="hidden sm:block px-8 pt-8 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between gap-2">
            {STEPS.map((step, index) => {
              const isCompleted = step.id < currentStep;
              const isActive = step.id === currentStep;
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className="flex items-center flex-1 last:flex-none"
                >
                  {/* Step */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted
                          ? "bg-emerald-500 text-white"
                          : isActive
                            ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="hidden lg:block">
                      <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                        Шаг {step.id}
                      </div>
                      <div
                        className={`text-sm font-semibold leading-tight ${
                          isActive
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {step.label}
                      </div>
                    </div>
                  </div>

                  {/* Connector */}
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 mx-3 h-px bg-gray-200 dark:bg-gray-800 relative">
                      <div
                        className="absolute inset-0 bg-emerald-500"
                        style={{ width: isCompleted ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile stepper - simple progress */}
        <div className="sm:hidden px-5 pt-5 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Шаг {currentStep} из 4
            </span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {Math.round((currentStep / 4) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-900 dark:bg-white"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="p-5 sm:p-8">
          {/* Step header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                <StepIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {currentStep === 1 && "Личная информация"}
                  {currentStep === 2 && "Ваш рост"}
                  {currentStep === 3 && "Ваш вес"}
                  {currentStep === 4 && "Уровень активности"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {currentStep === 1 && "Расскажите немного о себе"}
                  {currentStep === 2 &&
                    "Используется для расчёта дневной нормы калорий"}
                  {currentStep === 3 &&
                    "Текущий и целевой вес помогут построить план"}
                  {currentStep === 4 && "Это влияет на дневную норму калорий"}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          {renderStep()}
        </div>

        {/* Footer with navigation */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50 flex items-center gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Назад
            </button>
          ) : (
            <div />
          )}

          <div className="flex-1" />

          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-1.5 px-5 sm:px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Сохранение...
              </>
            ) : currentStep === 4 ? (
              <>
                Завершить
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                Далее
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
