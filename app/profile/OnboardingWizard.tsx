"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Ruler,
  Weight,
  Activity,
  UserCircle2,
  Users,
  Armchair,
  PersonStanding,
  Footprints,
  Dumbbell,
  Flame,
  Check,
  Loader2,
  Edit3,
  Calendar,
  TrendingDown,
  TrendingUp,
  Minus,
  Plus,
  Target,
  Sparkles,
  LogOut,
  LayoutDashboard,
  X,
  Save,
  Heart,
  Zap,
} from "lucide-react";

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

export function OnboardingWizard({ user }: OnboardingWizardProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [formData, setFormData] = useState({
    name: user.name || "",
    gender: user.gender || "",
    birthDay: user.birthDate
      ? new Date(user.birthDate).getDate()
      : 1,
    birthMonth: user.birthDate
      ? new Date(user.birthDate).getMonth() + 1
      : 1,
    birthYear: user.birthDate
      ? new Date(user.birthDate).getFullYear()
      : 2000,
    heightCm: user.heightCm || 170,
    weightStart: user.weightStart || 70,
    weightGoal: user.weightGoal || 65,
    activityLevel: user.activityLevel || "moderate",
    goal: "lose", // lose, gain, maintain
  });

  const calculateBMI = () => {
    if (!formData.heightCm || !formData.weightStart) return 0;
    const heightM = formData.heightCm / 100;
    return (formData.weightStart / (heightM * heightM)).toFixed(1);
  };

  const calculateCalories = () => {
    if (!formData.heightCm || !formData.weightStart || !formData.activityLevel) return 0;
    
    const height = formData.heightCm;
    const weight = formData.weightStart;
    const age = formData.birthYear ? new Date().getFullYear() - formData.birthYear : 25;
    
    let bmr = 0;
    if (formData.gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    
    const multiplier = activityMultipliers[formData.activityLevel as string] || 1.2;
    return Math.round(bmr * multiplier);
  };

  const handleSave = async () => {
    setIsSubmitting(true);

    try {
      const birthDate = `${formData.birthYear}-${String(formData.birthMonth).padStart(2, "0")}-${String(formData.birthDay).padStart(2, "0")}`;

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
        setToastMessage("✅ Профиль успешно сохранён!");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        const data = await response.json();
        setToastMessage("❌ " + (data.error || "Ошибка при сохранении"));
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      setToastMessage("❌ Произошла ошибка при сохранении");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  const bmi = calculateBMI();
  const calories = calculateCalories();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl px-6 py-4 flex items-center gap-3">
            <span className="text-sm font-medium text-gray-900 dark:text-white">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Sticky Topbar */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">{user.name || "Пользователь"}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium transition-colors flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => router.push("/api/auth/logout")}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Выйти
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 pb-32">
        {/* Section 1: Personal Information - Green */}
        <div className="mb-6 backdrop-blur-xl bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">👤 Личная информация</h2>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-500" />
                Имя
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-gray-900 dark:text-white transition-all"
                placeholder="Ваше имя"
              />
            </div>

            {/* Gender Pills */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Пол</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "male", label: "Мужской", icon: User, color: "blue" },
                  { value: "female", label: "Женский", icon: UserCircle2, color: "pink" },
                  { value: "other", label: "Другое", icon: Users, color: "purple" },
                ].map((option) => {
                  const Icon = option.icon;
                  const isActive = formData.gender === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: option.value })}
                      className={`relative p-4 rounded-xl border text-center transition-all ${
                        isActive
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-lg"
                          : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-white dark:bg-white/5"
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <Icon className={`w-6 h-6 mx-auto mb-2 text-${option.color}-500`} />
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{option.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Birth Date with Spinners */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                Дата рождения
              </label>
              <div className="grid grid-cols-3 gap-3">
                {/* Day Spinner */}
                <div className="relative">
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">День</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, birthDay: Math.max(1, formData.birthDay - 1) })}
                      className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                    <input
                      type="number"
                      value={formData.birthDay}
                      onChange={(e) => setFormData({ ...formData, birthDay: Math.min(31, Math.max(1, parseInt(e.target.value) || 1)) })}
                      className="flex-1 px-3 py-2 text-center rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-semibold outline-none"
                      min="1"
                      max="31"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, birthDay: Math.min(31, formData.birthDay + 1) })}
                      className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>
                </div>

                {/* Month Spinner */}
                <div className="relative">
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Месяц</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, birthMonth: Math.max(1, formData.birthMonth - 1) })}
                      className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                    <input
                      type="number"
                      value={formData.birthMonth}
                      onChange={(e) => setFormData({ ...formData, birthMonth: Math.min(12, Math.max(1, parseInt(e.target.value) || 1)) })}
                      className="flex-1 px-3 py-2 text-center rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-semibold outline-none"
                      min="1"
                      max="12"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, birthMonth: Math.min(12, formData.birthMonth + 1) })}
                      className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>
                </div>

                {/* Year Spinner */}
                <div className="relative">
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Год</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, birthYear: Math.max(1900, formData.birthYear - 1) })}
                      className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                    <input
                      type="number"
                      value={formData.birthYear}
                      onChange={(e) => setFormData({ ...formData, birthYear: Math.min(new Date().getFullYear(), Math.max(1900, parseInt(e.target.value) || 2000)) })}
                      className="flex-1 px-3 py-2 text-center rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-semibold outline-none"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, birthYear: Math.min(new Date().getFullYear(), formData.birthYear + 1) })}
                      className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Physical Parameters - Blue */}
        <div className="mb-6 backdrop-blur-xl bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <Ruler className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">📏 Физические параметры</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Height Spinner */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-blue-500" />
                Рост (см)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, heightCm: Math.max(100, formData.heightCm - 1) })}
                  className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </button>
                <input
                  type="number"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: Math.min(250, Math.max(100, parseInt(e.target.value) || 170)) })}
                  className="flex-1 px-3 py-2 text-center rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-semibold text-lg outline-none"
                  min="100"
                  max="250"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, heightCm: Math.min(250, formData.heightCm + 1) })}
                  className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Weight Spinner */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Weight className="w-4 h-4 text-blue-500" />
                Текущий вес (кг)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, weightStart: Math.max(30, formData.weightStart - 1) })}
                  className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </button>
                <input
                  type="number"
                  value={formData.weightStart}
                  onChange={(e) => setFormData({ ...formData, weightStart: Math.min(300, Math.max(30, parseInt(e.target.value) || 70)) })}
                  className="flex-1 px-3 py-2 text-center rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-semibold text-lg outline-none"
                  min="30"
                  max="300"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, weightStart: Math.min(300, formData.weightStart + 1) })}
                  className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>

          {/* AI Suggestion - BMI */}
          {bmi > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">AI-подсказка</div>
                  <div className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                    Ваш ИМТ: <span className="font-bold">{bmi}</span> {parseFloat(bmi) < 18.5 ? "(недостаточный вес)" : parseFloat(bmi) < 25 ? "(нормальный вес)" : parseFloat(bmi) < 30 ? "(избыточный вес)" : "(ожирение)"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Activity - Orange */}
        <div className="mb-6 backdrop-blur-xl bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">⚡ Активность</h2>
          </div>

          <div className="space-y-2">
            {[
              { value: "sedentary", icon: Armchair, title: "Минимальная", desc: "Сидячий образ жизни" },
              { value: "light", icon: PersonStanding, title: "Лёгкая", desc: "1-3 тренировки в неделю" },
              { value: "moderate", icon: Footprints, title: "Средняя", desc: "3-5 тренировок в неделю" },
              { value: "active", icon: Dumbbell, title: "Высокая", desc: "6-7 тренировок в неделю" },
              { value: "very_active", icon: Flame, title: "Очень высокая", desc: "Профессиональный спорт" },
            ].map((level) => {
              const Icon = level.icon;
              const isActive = formData.activityLevel === level.value;
              return (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, activityLevel: level.value })}
                  className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all ${
                    isActive
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10 shadow-lg"
                      : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isActive ? "bg-orange-100 dark:bg-orange-500/20" : "bg-gray-100 dark:bg-white/10"
                  }`}>
                    <Icon className={`w-6 h-6 ${isActive ? "text-orange-600 dark:text-orange-400" : "text-gray-600 dark:text-gray-400"}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">{level.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{level.desc}</div>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isActive ? "bg-orange-500" : "border-2 border-gray-300 dark:border-white/20"
                  }`}>
                    {isActive && <Check className="w-4 h-4 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* AI Suggestion - Calories */}
          {calories > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">AI-подсказка</div>
                  <div className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                    Рекомендуемая норма калорий: <span className="font-bold">{calories} ккал/день</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Goals - Purple */}
        <div className="mb-6 backdrop-blur-xl bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">🎯 Цели</h2>
          </div>

          {/* Goal Weight Spinner */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-500" />
              Целевой вес (кг)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, weightGoal: Math.max(30, formData.weightGoal - 1) })}
                className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <input
                type="number"
                value={formData.weightGoal}
                onChange={(e) => setFormData({ ...formData, weightGoal: Math.min(300, Math.max(30, parseInt(e.target.value) || 65)) })}
                className="flex-1 px-3 py-2 text-center rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-semibold text-lg outline-none"
                min="30"
                max="300"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, weightGoal: Math.min(300, formData.weightGoal + 1) })}
                className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Goal Type Selection */}
          <div className="space-y-2">
            {[
              { value: "lose", icon: TrendingDown, title: "Сбросить вес", desc: "Снижение массы тела" },
              { value: "maintain", icon: Minus, title: "Поддержать вес", desc: "Сохранение текущей формы" },
              { value: "gain", icon: TrendingUp, title: "Набрать вес", desc: "Увеличение массы тела" },
            ].map((goal) => {
              const Icon = goal.icon;
              const isActive = formData.goal === goal.value;
              return (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, goal: goal.value })}
                  className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all ${
                    isActive
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10 shadow-lg"
                      : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isActive ? "bg-purple-100 dark:bg-purple-500/20" : "bg-gray-100 dark:bg-white/10"
                  }`}>
                    <Icon className={`w-6 h-6 ${isActive ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-400"}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">{goal.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{goal.desc}</div>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isActive ? "bg-purple-500" : "border-2 border-gray-300 dark:border-white/20"
                  }`}>
                    {isActive && <Check className="w-4 h-4 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white font-semibold transition-all flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-emerald-500/50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Сохранить
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
