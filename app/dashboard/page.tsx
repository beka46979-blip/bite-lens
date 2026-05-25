import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "./LogoutButton";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import Link from "next/link";
import {
  Flame,
  Camera,
  History,
  ChevronRight,
  Beef,
  Droplet,
  Wheat,
  Check,
  Zap,
  Crown,
  Activity,
  Target,
  TrendingDown,
  TrendingUp,
  Scale,
  CalendarDays,
  LogOut,
  Sparkles,
} from "lucide-react";

// ── Milestone ──────────────────────────────────────────────────────────────────
function streakMilestone(s: number) {
  if (s >= 30)
    return { color: "#c4b5fd", border: "rgba(167,139,250,0.3)", bg: "rgba(139,92,246,0.1)", label: "Elite Consistency" };
  if (s >= 7)
    return { color: "#7dd3fc", border: "rgba(56,189,248,0.3)", bg: "rgba(56,189,248,0.1)", label: "Weekly Warrior" };
  if (s >= 3)
    return { color: "#fb923c", border: "rgba(249,115,22,0.3)", bg: "rgba(249,115,22,0.1)", label: "Momentum" };
  return { color: "#fb923c", border: "rgba(249,115,22,0.25)", bg: "rgba(249,115,22,0.08)", label: "Getting started" };
}

// ── Plans ──────────────────────────────────────────────────────────────────────
const PLANS = [
  {
    key: "FREE",
    name: "Free",
    Icon: Scale,
    price: null,
    priceLabel: "0 сом",
    badge: null,
    accent: "#10b981",
    accentBg: "rgba(16,185,129,0.1)",
    accentBorder: "rgba(16,185,129,0.2)",
    btnStyle: "outlined" as const,
    features: ["Трекер калорий", "3 приёма в день", "Базовые макро", "Без AI-сканирования", "Без аналитики"],
  },
  {
    key: "PREMIUM",
    name: "Pro",
    Icon: Zap,
    price: 490,
    priceLabel: "490 сом",
    badge: "ПОПУЛЯРНЫЙ",
    accent: "#10b981",
    accentBg: "rgba(16,185,129,0.1)",
    accentBorder: "rgba(16,185,129,0.3)",
    btnStyle: "green" as const,
    features: ["Всё из Free", "AI-сканирование", "Неограниченные снапы", "Детальная аналитика", "Персональный план"],
  },
  {
    key: "PRO",
    name: "Premium",
    Icon: Crown,
    price: 890,
    priceLabel: "890 сом",
    badge: "ЛУЧШИЙ",
    accent: "#f59e0b",
    accentBg: "rgba(245,158,11,0.1)",
    accentBorder: "rgba(245,158,11,0.3)",
    btnStyle: "amber" as const,
    features: ["Всё из Pro", "AI-тренер 24/7", "Рецепты под план", "Приоритетная поддержка", "Ранний доступ"],
  },
];

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const user = await prisma.users.findUnique({
    where: { id: currentUser.userId },
    select: {
      id: true, email: true, name: true, avatar: true,
      gender: true, weight_start: true, weight_goal: true,
      daily_kcal_target: true, onboarding_completed: true,
    },
  });

  if (!user) redirect("/login");
  if (!user.onboarding_completed) redirect("/profile");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [dailySummary, streak, subscription, recentMeals, recentActivityDays] =
    await Promise.all([
      prisma.daily_nutrition_summary.findUnique({
        where: { user_id_date: { user_id: currentUser.userId, date: today } },
      }),
      prisma.streaks.findUnique({ where: { user_id: currentUser.userId } }),
      prisma.subscriptions.findFirst({
        where: { user_id: currentUser.userId },
        orderBy: { created_at: "desc" },
      }),
      prisma.food_snaps.findMany({
        where: { user_id: currentUser.userId, created_at: { gte: today } },
        orderBy: { created_at: "desc" },
        take: 4,
        select: { id: true, image_url: true, dish_name: true, calories: true, created_at: true },
      }),
      prisma.daily_nutrition_summary.findMany({
        where: {
          user_id: currentUser.userId,
          date: {
            gte: (() => {
              const d = new Date(today);
              d.setDate(d.getDate() - 6);
              return d;
            })(),
          },
        },
        select: { date: true },
      }),
    ]);

  // ── Streak ─────────────────────────────────────────────────────────────────
  let activeStreak = 0;
  let isStreakActive = false;
  let isLoggedToday = false;

  if (streak) {
    const lastLog = new Date(streak.last_log_date);
    lastLog.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    isLoggedToday = lastLog.getTime() === today.getTime();
    if (isLoggedToday || lastLog.getTime() === yesterday.getTime()) {
      activeStreak = streak.current_streak;
      isStreakActive = true;
    }
  }

  const milestone = streakMilestone(activeStreak);

  const activeDays = new Set(
    recentActivityDays.map((d) => d.date.toISOString().split("T")[0]),
  );
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return {
      dateStr: d.toISOString().split("T")[0],
      label: d.toLocaleDateString("ru-RU", { weekday: "short" }).slice(0, 2).toUpperCase(),
      isToday: i === 6,
    };
  });

  // ── Calorie stats ──────────────────────────────────────────────────────────
  const dailyTarget = user.daily_kcal_target || 2000;
  const consumed = dailySummary?.total_calories || 0;
  const proteins = dailySummary?.total_proteins ? Number(dailySummary.total_proteins) : 0;
  const fats = dailySummary?.total_fats ? Number(dailySummary.total_fats) : 0;
  const carbs = dailySummary?.total_carbs ? Number(dailySummary.total_carbs) : 0;
  const remaining = Math.max(0, dailyTarget - consumed);
  const pct = dailyTarget > 0 ? Math.min(100, Math.round((consumed / dailyTarget) * 100)) : 0;
  const isOver = consumed > dailyTarget && dailyTarget > 0;
  const snapsCount = dailySummary?.snaps_count || 0;

  const proteinTarget = Math.round((dailyTarget * 0.3) / 4);
  const fatTarget = Math.round((dailyTarget * 0.3) / 9);
  const carbTarget = Math.round((dailyTarget * 0.4) / 4);
  const proteinPct = proteinTarget > 0 ? Math.min(100, Math.round((proteins / proteinTarget) * 100)) : 0;
  const fatPct = fatTarget > 0 ? Math.min(100, Math.round((fats / fatTarget) * 100)) : 0;
  const carbPct = carbTarget > 0 ? Math.min(100, Math.round((carbs / carbTarget) * 100)) : 0;

  // Ring SVG (radius 68, size 180×180)
  const R = 68;
  const CIRC = 2 * Math.PI * R;
  const ringOffset = CIRC - (pct / 100) * CIRC;
  const ringColor = isOver ? "#ef4444" : pct >= 90 ? "#f59e0b" : "#10b981";

  // Weight / goal
  const wStart = user.weight_start ? Number(user.weight_start) : 0;
  const wGoal = user.weight_goal ? Number(user.weight_goal) : 0;
  const wDiff = wStart - wGoal;
  const goalType = wDiff > 0 ? "lose" : wDiff < 0 ? "gain" : "maintain";

  // Subscription
  const currentPlan = subscription?.plan_type ?? "FREE";
  let trialDaysLeft: number | null = null;
  if (subscription?.status === "TRIAL" && subscription.trial_ends_at) {
    const ms = subscription.trial_ends_at.getTime() - Date.now();
    trialDaysLeft = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }

  const todayStr = today.toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f0f2f8] dark:bg-[#080b14] pb-28 relative">

      {/* ── Ambient glow blobs ──────────────────────────────────────────── */}
      <div className="dash-ambient-green" aria-hidden />
      <div className="dash-ambient-purple" aria-hidden />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30"
        style={{
          background: "rgba(240,242,248,0.85)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
        }}
      >
        <div
          className="absolute inset-0 hidden dark:block pointer-events-none"
          style={{
            background: "rgba(8,11,20,0.88)",
            borderBottom: "1px solid rgba(255,255,255,0.055)",
          }}
        />
        <div className="max-w-lg mx-auto px-4 relative">
          <div className="flex items-center justify-between h-14">
            <Link href="/profile" className="flex items-center gap-2.5 min-w-0 group">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || ""}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-400/25 flex-shrink-0"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}
                >
                  {user.name?.[0]?.toUpperCase() || "У"}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate leading-tight font-display">
                  {user.name || "Профиль"}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 capitalize truncate">
                  {todayStr}
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-1 flex-shrink-0">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="max-w-lg mx-auto px-3.5 py-4 space-y-3 relative z-10">

        {/* ── Streak card ─────────────────────────────────────────────── */}
        <div
          className="dash-glass dash-enter rounded-2xl p-4 relative overflow-hidden"
          style={{ "--enter-delay": "0.05s" } as React.CSSProperties}
        >
          {/* Active streak: warm glow overlay */}
          {isStreakActive && (
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.06) 0%, transparent 60%)" }}
            />
          )}

          <div className="relative">
            {/* Labels row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Flame
                  className={`w-3.5 h-3.5 ${isStreakActive ? "animate-flame" : ""}`}
                  style={{ color: isStreakActive ? milestone.color : "#6b7280" }}
                />
                <span
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: isStreakActive ? milestone.color : "#6b7280" }}
                >
                  Ударный режим
                </span>
              </div>
              <div className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  7 дней
                </span>
              </div>
            </div>

            {/* Counter + day dots */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Flame icon with glow */}
                <div className="relative flex-shrink-0">
                  {isStreakActive && (
                    <div
                      className="absolute inset-0 blur-2xl rounded-full scale-150 pointer-events-none"
                      style={{ background: `${milestone.color}35` }}
                    />
                  )}
                  <Flame
                    className={`relative w-11 h-11 ${isStreakActive ? "animate-flame" : "opacity-20 grayscale"}`}
                    style={{ color: milestone.color }}
                  />
                </div>

                {/* Number */}
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className={`text-[40px] leading-none font-display font-black tabular-nums ${isStreakActive ? "text-gray-900 dark:text-white" : "text-gray-300 dark:text-gray-700"}`}
                    >
                      {activeStreak}
                    </span>
                    <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 mb-0.5">
                      {activeStreak === 1 ? "день" : activeStreak <= 4 ? "дня" : "дней"}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">
                    Рекорд: {streak?.max_streak || 0} дн.
                  </p>
                </div>
              </div>

              {/* 7 day dots */}
              <div className="flex items-center gap-1.5">
                {last7Days.map(({ dateStr, label, isToday }) => {
                  const active = activeDays.has(dateStr);
                  return (
                    <div key={dateStr} className="flex flex-col items-center gap-0.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                        style={
                          active
                            ? { background: milestone.color, boxShadow: `0 0 10px ${milestone.color}55` }
                            : isToday
                              ? { background: "rgba(255,255,255,0.06)", border: `1.5px dashed ${milestone.color}80` }
                              : { background: "rgba(156,163,175,0.12)", border: "1.5px solid rgba(156,163,175,0.2)" }
                        }
                      >
                        {active ? (
                          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        ) : (
                          <span className="text-[8px] font-bold text-gray-400 dark:text-gray-600">{label}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status pill */}
            <div className="mt-3 flex justify-between items-center">
              <span
                className="text-[10px] font-bold text-gray-400 dark:text-gray-500"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {isStreakActive ? milestone.label : "Начни трекинг"}
              </span>
              {isLoggedToday ? (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}
                >
                  <Check className="w-3 h-3" strokeWidth={3} />
                  Выполнено
                </span>
              ) : isStreakActive ? (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: milestone.bg, color: milestone.color, border: `1px solid ${milestone.border}` }}
                >
                  <Flame className="w-3 h-3" />
                  Не пропусти!
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* ── 2-col: Calories | Weight+Goal ───────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">

          {/* Calories card */}
          <div
            className="dash-glass dash-glow-green dash-enter dash-hover rounded-2xl p-4 flex flex-col"
            style={{ "--enter-delay": "0.12s" } as React.CSSProperties}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-semibold text-gray-600 dark:text-gray-400">Калории</p>
              <span
                className="text-[9px] font-black px-2 py-0.5 rounded-full"
                style={
                  isOver
                    ? { background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }
                    : { background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }
                }
              >
                {isOver ? "Превышение" : "В норме"}
              </span>
            </div>

            {/* Animated donut ring */}
            <div className="flex justify-center my-1">
              <div className="relative">
                <svg width="144" height="144" className="-rotate-90">
                  {/* Track */}
                  <circle cx="72" cy="72" r={R} fill="none" strokeWidth="11"
                    className="stroke-gray-100 dark:stroke-white/5" />
                  {/* Fill — animated */}
                  <circle
                    cx="72" cy="72" r={R} fill="none" strokeWidth="11"
                    strokeLinecap="round"
                    strokeDasharray={CIRC}
                    strokeDashoffset={ringOffset}
                    className="dash-ring"
                    style={{
                      stroke: ringColor,
                      filter: `drop-shadow(0 0 8px ${ringColor}80)`,
                      "--ring-from": String(Math.ceil(CIRC)),
                      "--ring-to": String(Math.round(ringOffset)),
                    } as React.CSSProperties}
                  />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p
                    className="text-[26px] leading-none font-black text-gray-900 dark:text-white font-display"
                    style={{ color: ringColor }}
                  >
                    {consumed}
                  </p>
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">из {dailyTarget}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-1.5 mt-1">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(16,185,129,0.12)" }}>
                  <Flame className="w-3 h-3" style={{ color: "#10b981" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-none">Съедено</p>
                  <p className="text-[13px] font-black font-display text-gray-800 dark:text-gray-100 leading-tight">
                    {consumed}
                    <span className="text-[9px] font-normal text-gray-400 ml-0.5">ккал</span>
                  </p>
                </div>
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">{pct}%</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: isOver ? "rgba(239,68,68,0.1)" : "rgba(20,184,166,0.1)" }}>
                  <Target className="w-3 h-3" style={{ color: isOver ? "#ef4444" : "#14b8a6" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-none">
                    {isOver ? "Превышение" : "Осталось"}
                  </p>
                  <p className="text-[13px] font-black font-display leading-tight"
                    style={{ color: isOver ? "#ef4444" : undefined }}>
                    <span className="text-gray-800 dark:text-gray-100">
                      {isOver ? consumed - dailyTarget : remaining}
                    </span>
                    <span className="text-[9px] font-normal text-gray-400 ml-0.5">ккал</span>
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/scan-food"
              className="mt-3 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-[11px] font-bold transition-all active:scale-95"
              style={{
                background: "linear-gradient(135deg, #10b981, #0891b2)",
                boxShadow: "0 4px 16px rgba(16,185,129,0.35)",
              }}
            >
              <Camera className="w-3.5 h-3.5" />
              Добавить приём
            </Link>
          </div>

          {/* Weight + Goal column */}
          <div className="space-y-3">
            {/* Weight card */}
            <div
              className="dash-glass dash-enter dash-hover rounded-2xl p-4"
              style={{ "--enter-delay": "0.18s" } as React.CSSProperties}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Текущий вес</p>
                <Activity className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="font-display font-black text-gray-900 dark:text-white leading-none">
                <span className="text-[28px]">{wStart ? wStart.toFixed(1) : "—"}</span>
                <span className="text-[13px] font-semibold text-gray-400 ml-1">кг</span>
              </p>

              {/* Sparkline */}
              <div className="mt-2.5 overflow-hidden">
                <svg viewBox="0 0 100 28" className="w-full h-7" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,20 C8,20 12,15 22,14 C32,13 36,17 48,13 C60,9 66,8 78,7 C88,6 94,9 100,8"
                    fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 4px rgba(16,185,129,0.5))" }}
                  />
                  <path
                    d="M0,20 C8,20 12,15 22,14 C32,13 36,17 48,13 C60,9 66,8 78,7 C88,6 94,9 100,8 L100,28 L0,28 Z"
                    fill="url(#sparkGrad)"
                  />
                </svg>
              </div>
            </div>

            {/* Goal card */}
            <div
              className="dash-glass dash-enter dash-hover rounded-2xl p-4"
              style={{ "--enter-delay": "0.22s" } as React.CSSProperties}
            >
              <div className="flex items-center gap-1.5 mb-2">
                {goalType === "lose" ? (
                  <TrendingDown className="w-3.5 h-3.5" style={{ color: "#f97316" }} />
                ) : goalType === "gain" ? (
                  <TrendingUp className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
                ) : (
                  <Target className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
                )}
                <p
                  className="text-[9px] font-black uppercase tracking-widest"
                  style={{
                    color: goalType === "lose" ? "#f97316" : goalType === "gain" ? "#a78bfa" : "#10b981",
                  }}
                >
                  {goalType === "lose" ? "Похудение" : goalType === "gain" ? "Набор" : "Поддержание"}
                </p>
              </div>
              <p className="font-display font-black text-gray-900 dark:text-white leading-none">
                <span className="text-[24px]">{Math.abs(wDiff).toFixed(1)}</span>
                <span className="text-[11px] font-semibold text-gray-400 ml-1">кг</span>
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                Цель: {wGoal.toFixed(1)} кг
              </p>
              <div className="mt-2.5 w-full h-1.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full dash-bar"
                  style={{
                    width: goalType === "maintain" ? "100%" : `${Math.min(100, 60)}%`,
                    background: goalType === "lose" ? "#f97316" : goalType === "gain" ? "#a78bfa" : "#10b981",
                    "--bar-delay": "0.6s",
                  } as React.CSSProperties}
                />
              </div>
              <p className="text-[10px] text-right mt-1"
                style={{ color: goalType === "lose" ? "#f97316" : goalType === "gain" ? "#a78bfa" : "#10b981" }}>
                {goalType === "maintain" ? "100%" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* ── Macros row ───────────────────────────────────────────────── */}
        <div
          className="grid grid-cols-3 gap-2 dash-enter"
          style={{ "--enter-delay": "0.28s" } as React.CSSProperties}
        >
          {/* Proteins */}
          <div className="dash-glass dash-hover rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <Beef className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">Белки</p>
              </div>
              <p className="text-[9px] font-bold" style={{ color: "#10b981" }}>{proteinPct}%</p>
            </div>
            <div className="flex items-baseline gap-0.5 mb-1.5">
              <span className="text-[20px] font-black font-display text-gray-900 dark:text-white leading-none">
                {proteins.toFixed(0)}
              </span>
              <span className="text-[9px] text-gray-400 dark:text-gray-500 mb-0.5">/{proteinTarget}г</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full dash-bar"
                style={{
                  width: `${proteinPct}%`,
                  background: "linear-gradient(90deg, #10b981, #059669)",
                  boxShadow: "0 0 6px rgba(16,185,129,0.4)",
                  "--bar-delay": "0.5s",
                } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Fats */}
          <div className="dash-glass dash-hover rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5" style={{ color: "#f97316" }} />
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">Жиры</p>
              </div>
              <p className="text-[9px] font-bold" style={{ color: "#f97316" }}>{fatPct}%</p>
            </div>
            <div className="flex items-baseline gap-0.5 mb-1.5">
              <span className="text-[20px] font-black font-display text-gray-900 dark:text-white leading-none">
                {fats.toFixed(0)}
              </span>
              <span className="text-[9px] text-gray-400 dark:text-gray-500 mb-0.5">/{fatTarget}г</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full dash-bar"
                style={{
                  width: `${fatPct}%`,
                  background: "linear-gradient(90deg, #f97316, #ea580c)",
                  boxShadow: "0 0 6px rgba(249,115,22,0.4)",
                  "--bar-delay": "0.62s",
                } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="dash-glass dash-hover rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <Wheat className="w-3.5 h-3.5" style={{ color: "#8b5cf6" }} />
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">Углеводы</p>
              </div>
              <p className="text-[9px] font-bold" style={{ color: "#8b5cf6" }}>{carbPct}%</p>
            </div>
            <div className="flex items-baseline gap-0.5 mb-1.5">
              <span className="text-[20px] font-black font-display text-gray-900 dark:text-white leading-none">
                {carbs.toFixed(0)}
              </span>
              <span className="text-[9px] text-gray-400 dark:text-gray-500 mb-0.5">/{carbTarget}г</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full dash-bar"
                style={{
                  width: `${carbPct}%`,
                  background: "linear-gradient(90deg, #8b5cf6, #7c3aed)",
                  boxShadow: "0 0 6px rgba(139,92,246,0.4)",
                  "--bar-delay": "0.74s",
                } as React.CSSProperties}
              />
            </div>
          </div>
        </div>

        {/* ── Today's meals ─────────────────────────────────────────────── */}
        <div
          className="dash-glass dash-enter rounded-2xl overflow-hidden"
          style={{ "--enter-delay": "0.35s" } as React.CSSProperties}
        >
          <div className="flex items-center justify-between px-4 py-3.5"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            <div>
              <p className="text-[13px] font-bold text-gray-900 dark:text-white">
                Сегодняшние приёмы пищи
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                {recentMeals.length > 0 ? "Последние записи" : "Записей пока нет"}
              </p>
            </div>
            <Link
              href="/meal-history"
              className="flex items-center gap-0.5 text-[11px] font-semibold hover:opacity-70 transition-opacity"
              style={{ color: "#10b981" }}
            >
              Вся история <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentMeals.length > 0 ? (
            <div>
              {recentMeals.map((meal, i) => (
                <div
                  key={meal.id}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                  style={{
                    borderBottom: i < recentMeals.length - 1 ? "1px solid rgba(0,0,0,0.04)" : undefined,
                  }}
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-white/5">
                    <img src={meal.image_url} alt={meal.dish_name || "Meal"} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-900 dark:text-white truncate">
                      {meal.dish_name || "Без названия"}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">
                      {new Date(meal.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[14px] font-black font-display text-gray-900 dark:text-white">
                      {meal.calories || 0}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">ккал</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "rgba(16,185,129,0.1)" }}
              >
                <Camera className="w-6 h-6" style={{ color: "#10b981" }} />
              </div>
              <p className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Начните отслеживать питание
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-4">
                Сфотографируйте еду — AI рассчитает калории
              </p>
              <Link
                href="/scan-food"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-[12px] font-bold"
                style={{ background: "linear-gradient(135deg, #10b981, #0891b2)" }}
              >
                <Camera className="w-3.5 h-3.5" />
                Сделать первое фото
              </Link>
            </div>
          )}
        </div>

        {/* ── Plans section ─────────────────────────────────────────────── */}
        <div
          className="dash-enter"
          style={{ "--enter-delay": "0.42s" } as React.CSSProperties}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 px-0.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Тарифы
              </span>
            </div>
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              {trialDaysLeft !== null ? `Пробный: ${trialDaysLeft} дн.` : `Сейчас: ${currentPlan}`}
            </span>
          </div>
          <h2 className="text-[20px] font-black font-display text-gray-900 dark:text-white mb-4 px-0.5">
            Выбери свой{" "}
            <span style={{ color: "#10b981" }}>план</span>
          </h2>

          {/* Cards — horizontal scroll */}
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-3.5 px-3.5 snap-x snap-mandatory scrollbar-none">
            {PLANS.map((plan) => {
              const Icon = plan.Icon;
              const isCurrent = currentPlan?.toUpperCase() === plan.key;

              return (
                <div
                  key={plan.key}
                  className="flex-shrink-0 w-[195px] snap-start rounded-2xl overflow-hidden relative"
                >
                  {/* Light bg */}
                  <div
                    className="absolute inset-0 dark:hidden rounded-2xl pointer-events-none"
                    style={{
                      background:
                        plan.key === "FREE" ? "rgba(255,255,255,0.9)" :
                        plan.key === "PREMIUM" ? "linear-gradient(160deg, #f0fdf9, #ecfdf5)" :
                        "linear-gradient(160deg, #fffbeb, #fef3c7)",
                      border: `1.5px solid ${plan.key === "FREE" ? "#e5e7eb" : plan.accentBorder}`,
                    }}
                  />
                  {/* Dark bg */}
                  <div
                    className="absolute inset-0 hidden dark:block rounded-2xl pointer-events-none"
                    style={{
                      background:
                        plan.key === "FREE" ? "rgba(255,255,255,0.045)" :
                        plan.key === "PREMIUM" ? "linear-gradient(160deg, rgba(16,185,129,0.07), rgba(16,185,129,0.03))" :
                        "linear-gradient(160deg, rgba(245,158,11,0.08), rgba(245,158,11,0.03))",
                      border: `1.5px solid ${plan.key === "FREE" ? "rgba(255,255,255,0.06)" : plan.accentBorder}`,
                      boxShadow: plan.key !== "FREE" ? `0 0 40px ${plan.accentBg}` : undefined,
                    }}
                  />

                  <div className="relative p-4 flex flex-col h-full">
                    {/* Badge */}
                    {plan.badge ? (
                      <div
                        className="self-start text-[9px] font-black px-2 py-0.5 rounded-full mb-3 tracking-wider"
                        style={{ background: plan.accentBg, color: plan.accent, border: `1px solid ${plan.accentBorder}` }}
                      >
                        {plan.badge}
                      </div>
                    ) : (
                      <div className="h-5 mb-3" />
                    )}

                    {/* Icon + name */}
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: plan.accentBg }}
                      >
                        <Icon className="w-4 h-4" style={{ color: plan.accent }} />
                      </div>
                      <p className="text-[14px] font-black font-display text-gray-900 dark:text-white">
                        {plan.name}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-3">
                      {plan.price ? (
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-[22px] font-black font-display text-gray-900 dark:text-white leading-none">
                            {plan.price}
                          </span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-1">сом/мес</span>
                        </div>
                      ) : (
                        <p className="text-[16px] font-black text-gray-500 dark:text-gray-400">0 сом</p>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-1.5 mb-4 flex-1">
                      {plan.features.map((f) => (
                        <div key={f} className="flex items-start gap-1.5">
                          {f.startsWith("Без") ? (
                            <div className="w-3.5 h-3.5 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-1.5 h-0.5 bg-gray-400 rounded-full" />
                            </div>
                          ) : (
                            <div
                              className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ background: plan.accentBg }}
                            >
                              <Check className="w-2.5 h-2.5" style={{ color: plan.accent }} strokeWidth={3} />
                            </div>
                          )}
                          <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-tight">{f}</p>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/subscription?plan=${plan.key.toLowerCase()}`}
                      className="w-full py-2.5 rounded-xl text-[11px] font-black text-center transition-all active:scale-95 hover:opacity-90"
                      style={
                        isCurrent
                          ? { background: "transparent", color: "#9ca3af", border: "1.5px solid rgba(156,163,175,0.3)" }
                          : plan.btnStyle === "green"
                            ? { background: "linear-gradient(135deg, #10b981, #0891b2)", color: "#fff", boxShadow: "0 4px 14px rgba(16,185,129,0.4)" }
                            : plan.btnStyle === "amber"
                              ? { background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", boxShadow: "0 4px 14px rgba(245,158,11,0.4)" }
                              : { background: "transparent", color: "#6b7280", border: "1.5px solid rgba(156,163,175,0.3)" }
                      }
                    >
                      {isCurrent ? "Текущий план" : plan.key === "PREMIUM" ? "Перейти на Pro →" : plan.key === "PRO" ? "Получить Premium →" : "Начать бесплатно"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-[10px] text-gray-400 dark:text-gray-600 mt-3">
            Безопасная оплата · Отмена в любое время
          </p>
        </div>
      </main>

      {/* ── Fixed bottom nav ────────────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: "rgba(240,242,248,0.92)",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
        }}
      >
        <div
          className="absolute inset-0 hidden dark:block pointer-events-none"
          style={{
            background: "rgba(8,11,20,0.9)",
            borderTop: "1px solid rgba(255,255,255,0.055)",
          }}
        />
        <div className="max-w-lg mx-auto px-3 py-2.5 grid grid-cols-2 gap-2.5 relative">
          <Link
            href="/scan-food"
            className="flex items-center gap-3 p-3 rounded-2xl transition-all active:scale-95 hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #10b981, #0891b2)",
              boxShadow: "0 4px 18px rgba(16,185,129,0.3)",
            }}
          >
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-white leading-tight">Сканировать еду</p>
              <p className="text-[10px] text-white/65 truncate">
                {snapsCount > 0
                  ? `${snapsCount} ${snapsCount === 1 ? "снап" : snapsCount <= 4 ? "снапа" : "снапов"} сегодня`
                  : "AI анализ за секунды"}
              </p>
            </div>
          </Link>

          <Link
            href="/meal-history"
            className="flex items-center gap-3 p-3 rounded-2xl transition-all active:scale-95 hover:opacity-90 border"
            style={{
              background: "rgba(99,102,241,0.07)",
              borderColor: "rgba(99,102,241,0.15)",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(99,102,241,0.15)" }}
            >
              <History className="w-5 h-5" style={{ color: "#818cf8" }} />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-gray-900 dark:text-white leading-tight">История питания</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">Все записи и статистика</p>
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
}
