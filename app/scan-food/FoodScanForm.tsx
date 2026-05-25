"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Upload,
  Loader2,
  X,
  Check,
  Utensils,
  Save,
  ForkKnife,
  Coins,
  CreditCard,
  Hand,
  PillBottle,
  BottleWine,
  Ruler,
  Pencil,
  Flame,
} from "lucide-react";
import Image from "next/image";
import { PaywallModal, PaywallReason } from "@/app/components/PaywallModal";
import { StreakCelebration } from "@/app/components/StreakCelebration";

interface RecentMeal {
  id: string;
  dish_name: string | null;
  calories: number | null;
  created_at: Date;
  image_url: string;
}

interface Props {
  userId: string;
  recentMeals?: RecentMeal[];
  trialDaysLeft?: number | null;
}

const SCALE_OBJECTS = [
  { value: "none", Icon: X, label: "Без объекта", hint: "" },
  {
    value: "spoon",
    Icon: Utensils,
    label: "Ложка",
    hint: "столовая ложка ~20 см",
  },
  { value: "fork", Icon: ForkKnife, label: "Вилка", hint: "вилка ~18–20 см" },
  { value: "coin", Icon: Coins, label: "Монета", hint: "монета ~2–3 см" },
  {
    value: "card",
    Icon: CreditCard,
    label: "Банк. карта",
    hint: "8.5 × 5.4 см",
  },
  { value: "hand", Icon: Hand, label: "Ладонь", hint: "ладонь ~18–20 см" },
  {
    value: "can",
    Icon: PillBottle,
    label: "Банка 330 мл",
    hint: "высота ~11 см, диам. 6.5 см",
  },
  {
    value: "bottle",
    Icon: BottleWine,
    label: "Бутылка 0.5л",
    hint: "высота ~22 см, диам. 7 см",
  },
  {
    value: "chopsticks",
    Icon: Pencil,
    label: "Палочки",
    hint: "палочки для еды ~23–25 см",
  },
];

const MEAL_TYPES = [
  { value: "BREAKFAST", label: "Завтрак", icon: "🌅" },
  { value: "LUNCH", label: "Обед", icon: "☀️" },
  { value: "DINNER", label: "Ужин", icon: "🌙" },
  { value: "SNACK", label: "Перекус", icon: "🍎" },
];

export function FoodScanForm({ userId, recentMeals, trialDaysLeft }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [originalAnalysis, setOriginalAnalysis] = useState<any>(null);
  const [editedWeight, setEditedWeight] = useState<string>("");
  const [scaleObject, setScaleObject] = useState<string>("none");
  const [selectedMealType, setSelectedMealType] = useState<string>("SNACK");
  const [isMobile, setIsMobile] = useState(false);
  // Paywall
  const [paywallReason, setPaywallReason] = useState<PaywallReason | null>(null);
  const [paywallSnapsUsed, setPaywallSnapsUsed] = useState<number | undefined>();
  const [paywallDailyLimit, setPaywallDailyLimit] = useState<number | undefined>();
  // Streak celebration
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationStreak, setCelebrationStreak] = useState(0);
  // Подтверждение результата: 'pending' | 'confirmed' | 'editing'
  const [confirmMode, setConfirmMode] = useState<
    "pending" | "confirmed" | "editing"
  >("pending");

  useEffect(() => {
    const checkMobile = () => {
      const userAgent =
        navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent,
        );
      setIsMobile(isMobileDevice);
    };
    checkMobile();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Пожалуйста, выберите изображение");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Размер файла не должен превышать 10MB");
      return;
    }

    setImageFile(file);
    setError("");
    setSuccess("");
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageFile) {
      setError("Пожалуйста, выберите изображение");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("scaleObject", scaleObject);

      const response = await fetch("/api/food/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.status === 402) {
        const reason: PaywallReason =
          data.error === "limit_reached"
            ? "limit_reached"
            : data.error === "trial_expired"
            ? "trial_expired"
            : "no_subscription";
        setPaywallSnapsUsed(data.snapsUsed);
        setPaywallDailyLimit(data.dailyLimit);
        setPaywallReason(reason);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при анализе изображения");
      }

      setAnalysisResult(data);
      setOriginalAnalysis(data);
      setEditedWeight(String(data.weightGram || ""));
      setConfirmMode("pending");
      setSuccess("");
    } catch (err: any) {
      setError(err.message || "Ошибка при анализе изображения");
    } finally {
      setIsLoading(false);
    }
  };

  // Пересчёт КБЖУ при изменении веса
  const getScaledResult = () => {
    if (!originalAnalysis) return analysisResult;
    const newWeight = parseFloat(editedWeight);
    if (
      !newWeight ||
      !originalAnalysis.weightGram ||
      newWeight === originalAnalysis.weightGram
    ) {
      return analysisResult;
    }
    const ratio = newWeight / originalAnalysis.weightGram;
    return {
      ...analysisResult,
      weightGram: newWeight,
      totalCalories: Math.round((originalAnalysis.totalCalories || 0) * ratio),
      totalProteins:
        Math.round((originalAnalysis.totalProteins || 0) * ratio * 10) / 10,
      totalFats:
        Math.round((originalAnalysis.totalFats || 0) * ratio * 10) / 10,
      totalCarbs:
        Math.round((originalAnalysis.totalCarbs || 0) * ratio * 10) / 10,
      foods: (originalAnalysis.foods || []).map((food: any) => ({
        ...food,
        calories: Math.round((food.calories || 0) * ratio),
        proteins: Math.round((food.proteins || 0) * ratio * 10) / 10,
        fats: Math.round((food.fats || 0) * ratio * 10) / 10,
        carbs: Math.round((food.carbs || 0) * ratio * 10) / 10,
        weight: food.weight ? Math.round(food.weight * ratio) : undefined,
      })),
    };
  };

  const handleSave = async () => {
    if (!analysisResult) return;

    const scaled = getScaledResult();
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/food/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...scaled,
          mealType: selectedMealType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при сохранении");
      }

      // Show streak celebration if this is the first log of the day
      if (data.streak?.isFirstLogToday && data.streak?.current > 0) {
        setCelebrationStreak(data.streak.current);
        setShowCelebration(true);
      } else {
        setSuccess("Сохранено!");
        setTimeout(() => router.push("/dashboard"), 900);
      }
    } catch (err: any) {
      setError(err.message || "Ошибка при сохранении");
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImageFile(null);
    setAnalysisResult(null);
    setOriginalAnalysis(null);
    setEditedWeight("");
    setError("");
    setSuccess("");
    setSelectedMealType("SNACK");
    setConfirmMode("pending");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Streak celebration overlay */}
      {showCelebration && (
        <StreakCelebration
          streak={celebrationStreak}
          onDone={() => {
            setShowCelebration(false);
            router.push("/dashboard");
          }}
        />
      )}

      {/* Paywall modal */}
      {paywallReason && (
        <PaywallModal
          reason={paywallReason}
          snapsUsed={paywallSnapsUsed}
          dailyLimit={paywallDailyLimit}
          trialDaysLeft={trialDaysLeft ?? undefined}
          onClose={
            paywallReason === "limit_reached"
              ? () => setPaywallReason(null)
              : undefined
          }
        />
      )}
      {/* Сообщения */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <X className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-red-800 dark:text-red-200 font-medium">
              {error}
            </p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-green-800 dark:text-green-200 font-medium">
              {success}
            </p>
          </div>
        </div>
      )}

      {/* Загрузка изображения */}
      {!selectedImage ? (
        <div className="space-y-4">
          {/* Главная карточка загрузки */}
          <div className="relative overflow-hidden bg-linear-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl shadow-2xl">
            {/* Декоративные блики */}
            <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

            <div className="relative p-8 sm:p-10 text-center">
              {/* Иконка */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-4 ring-white/25 shadow-xl">
                    <Camera className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                    <span className="text-white text-base font-bold leading-none">
                      +
                    </span>
                  </div>
                </div>
              </div>

              {/* Текст */}
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Сфотографируйте еду
              </h3>
              <p className="text-white/75 text-sm sm:text-base mb-8">
                ИИ определит калории, БЖУ и вес порции за секунды
              </p>

              {/* Кнопки */}
              <div className="flex flex-col sm:flex-row gap-3">
                {isMobile ? (
                  <>
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white text-emerald-700 rounded-2xl font-bold shadow-lg hover:bg-emerald-50 active:scale-95 transition-all"
                    >
                      <Camera className="w-5 h-5" />
                      Сделать фото
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-bold border border-white/30 hover:bg-white/30 active:scale-95 transition-all"
                    >
                      <Upload className="w-5 h-5" />
                      Галерея
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-white text-emerald-700 rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-50 active:scale-95 transition-all"
                  >
                    <Upload className="w-5 h-5" />
                    Выбрать изображение
                  </button>
                )}
              </div>

              <p className="text-white/50 text-xs mt-4">
                JPG, PNG, WEBP • максимум 10 МБ
              </p>
            </div>
          </div>

          {/* Подсказка о масштабных объектах */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-emerald-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <Ruler className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="text-sm font-bold text-gray-800 dark:text-white">
                Совет: положите рядом объект для масштаба
              </h4>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              ИИ использует его размер как опорную точку — точнее определит
              размер тарелки и вес
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { Icon: Utensils, label: "Ложка" },
                { Icon: ForkKnife, label: "Вилка" },
                { Icon: CreditCard, label: "Карта" },
                { Icon: Coins, label: "Монета" },
                { Icon: Hand, label: "Ладонь" },
                { Icon: PillBottle, label: "Банка" },
              ].map(({ Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-medium border border-emerald-100 dark:border-emerald-800"
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </span>
              ))}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Preview изображения */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                Выбранное фото
              </h3>
              <button
                onClick={handleReset}
                className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-lg">
              <Image
                src={selectedImage}
                alt="Selected food"
                fill
                className="object-contain"
              />
            </div>

            {!analysisResult && (
              <div className="mt-6 space-y-4">
                {/* Выбор объекта масштаба */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">📏</span>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Есть ли рядом объект для масштаба?
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {SCALE_OBJECTS.map((obj) => (
                      <button
                        key={obj.value}
                        type="button"
                        onClick={() => setScaleObject(obj.value)}
                        title={obj.hint}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${
                          scaleObject === obj.value
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                            : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-emerald-300"
                        }`}
                      >
                        <obj.Icon
                          className={`w-5 h-5 ${scaleObject === obj.value ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"}`}
                        />
                        <span
                          className={`text-[10px] font-medium text-center leading-tight ${
                            scaleObject === obj.value
                              ? "text-emerald-700 dark:text-emerald-300"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {obj.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  {scaleObject !== "none" && (
                    <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      {SCALE_OBJECTS.find((o) => o.value === scaleObject)?.hint}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-bold text-lg shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Анализируем...
                    </>
                  ) : (
                    <>
                      <Utensils className="w-6 h-6" />
                      Анализировать
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Карточка подтверждения */}
          {analysisResult && confirmMode === "pending" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-100 dark:border-gray-700 shadow-xl overflow-hidden">
              {/* Шапка */}
              <div className="bg-linear-to-r from-emerald-500 to-teal-600 px-5 py-3 flex items-center gap-2">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <Utensils className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-sm font-semibold text-white">
                  ИИ определил блюдо
                </p>
              </div>

              {/* Список полей */}
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                <div className="flex items-center gap-3 px-5 py-4">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                    <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Блюдо
                    </p>
                    <p className="font-bold text-gray-900 dark:text-white truncate">
                      {analysisResult.dishName || "Aнализ завершён"}
                    </p>
                  </div>
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                </div>

                <div className="flex items-center gap-3 px-5 py-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <Ruler className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Вес порции
                    </p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      ~{analysisResult.weightGram} г
                    </p>
                  </div>
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                </div>

                <div className="flex items-center gap-3 px-5 py-4">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Калорийность
                    </p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      ~{analysisResult.totalCalories} ккал
                    </p>
                  </div>
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                </div>
              </div>

              {/* Кнопки */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-700/50">
                <button
                  onClick={() => setConfirmMode("editing")}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:border-emerald-300 dark:hover:border-emerald-600 transition-all"
                >
                  <Pencil className="w-4 h-4" />
                  Изменить
                </button>
                <button
                  onClick={() => setConfirmMode("confirmed")}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-md shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700 transition-all"
                >
                  <Check className="w-4 h-4" />
                  Верно
                </button>
              </div>
            </div>
          )}

          {/* Результаты анализа */}
          {analysisResult &&
            (confirmMode === "confirmed" || confirmMode === "editing") &&
            (() => {
              const scaled = getScaledResult();
              const weightChanged =
                parseFloat(editedWeight) !== originalAnalysis?.weightGram;
              return (
                <div className="space-y-6">
                  {/* ── Блок уточнения веса (только в режиме editing) ── */}
                  {confirmMode === "editing" && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-emerald-200 dark:border-emerald-700 p-5 shadow-lg">
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
                        🍽️ Похоже на{" "}
                        <span className="font-bold">
                          {analysisResult.dishName}
                        </span>
                      </p>
                      {analysisResult.weightNote && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                          {analysisResult.weightNote}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Укажите реальный вес — калории пересчитаются
                        автоматически
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                          <input
                            type="number"
                            min={1}
                            max={5000}
                            value={editedWeight}
                            onChange={(e) => {
                              const v = e.target.value.replace(/[^0-9]/g, "");
                              setEditedWeight(v);
                            }}
                            onWheel={(e) =>
                              (e.target as HTMLInputElement).blur()
                            }
                            className="w-full px-4 py-3 pr-10 rounded-xl border-2 border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/10 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-gray-900 dark:text-white font-bold text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                            г
                          </span>
                        </div>
                        {weightChanged && (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                            <Check className="w-4 h-4" />
                            Пересчитано
                          </div>
                        )}
                      </div>
                      <div className="mt-3 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                        {[
                          {
                            label: "Небольшая порция",
                            g: Math.round(
                              (originalAnalysis?.weightGram || 300) * 0.6,
                            ),
                          },
                          {
                            label: "Стандарт",
                            g: originalAnalysis?.weightGram || 300,
                          },
                          {
                            label: "Большая",
                            g: Math.round(
                              (originalAnalysis?.weightGram || 300) * 1.5,
                            ),
                          },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setEditedWeight(String(preset.g))}
                            className={`px-3 py-1.5 rounded-lg border transition-colors ${
                              parseInt(editedWeight) === preset.g
                                ? "bg-emerald-500 text-white border-emerald-500"
                                : "border-gray-200 dark:border-gray-600 hover:border-emerald-400"
                            }`}
                          >
                            {preset.label} ~{preset.g}г
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Карточка с калориями и БЖУ */}
                  <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                    <div className="relative grid md:grid-cols-2 gap-6 items-center">
                      <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-xl ring-4 ring-white/30">
                        <Image
                          src={analysisResult.imageUrl || selectedImage}
                          alt="Analyzed food"
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="text-white space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Utensils className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl sm:text-2xl font-bold">
                              {analysisResult.dishName || "Результаты анализа"}
                            </h3>
                            <p className="text-white/80 text-sm">
                              {analysisResult.verdict || "Пищевая ценность"}
                            </p>
                          </div>
                        </div>

                        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
                          <p className="text-white/90 text-sm font-medium mb-2">
                            Общая калорийность
                          </p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-5xl sm:text-6xl font-bold">
                              {scaled.totalCalories || 0}
                            </p>
                            <p className="text-2xl font-semibold text-white/80">
                              ккал
                            </p>
                          </div>
                          <p className="text-white/70 text-sm mt-2">
                            Вес порции:{" "}
                            <span className="font-semibold">
                              {editedWeight || scaled.weightGram}г
                            </span>
                          </p>
                          {analysisResult.confidence && (
                            <p className="text-white/70 text-xs mt-1">
                              Точность:{" "}
                              {Math.round(analysisResult.confidence * 100)}%
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                            <p className="text-white/80 text-xs mb-1">Белки</p>
                            <p className="text-2xl font-bold">
                              {scaled.totalProteins || 0}
                            </p>
                            <p className="text-white/70 text-xs">г</p>
                          </div>
                          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                            <p className="text-white/80 text-xs mb-1">Жиры</p>
                            <p className="text-2xl font-bold">
                              {scaled.totalFats || 0}
                            </p>
                            <p className="text-white/70 text-xs">г</p>
                          </div>
                          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                            <p className="text-white/80 text-xs mb-1">
                              Углеводы
                            </p>
                            <p className="text-2xl font-bold">
                              {scaled.totalCarbs || 0}
                            </p>
                            <p className="text-white/70 text-xs">г</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Список продуктов */}
                  {scaled.foods && scaled.foods.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                          <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        Обнаруженные продукты
                      </h4>
                      <div className="space-y-3">
                        {scaled.foods.map((food: any, index: number) => (
                          <div
                            key={index}
                            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center shadow-sm">
                                  <span className="text-xl">🍽️</span>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {food.name}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                  {food.calories}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  ккал
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                              <span>Б: {food.proteins}г</span>
                              <span>Ж: {food.fats}г</span>
                              <span>У: {food.carbs}г</span>
                              {food.weight && <span>• {food.weight}г</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Выбор типа приёма пищи */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Тип приёма пищи
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {MEAL_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setSelectedMealType(type.value)}
                          className={`p-4 rounded-xl border-2 font-semibold ${
                            selectedMealType === type.value
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                              : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-700"
                          }`}
                        >
                          <div className="text-2xl mb-1">{type.icon}</div>
                          <div className="text-sm">{type.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Кнопки действий */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={handleReset}
                      disabled={isSaving}
                      className="flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 shadow-md"
                    >
                      <X className="w-6 h-6" />
                      Отменить
                    </button>

                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-bold text-lg shadow-lg disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Save className="w-6 h-6" />
                          Сохранить
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })()}
        </div>
      )}
    </div>
  );
}
