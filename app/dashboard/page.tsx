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
  Sparkles,
} from "lucide-react";

// ── Streak Milestones ──────────────────────────────────────────────────────────
function streakMilestone(s: number) {
  if (s >= 30)
    return { color: "#c4b5fd", border: "rgba(167,139,250,0.3)", bg: "rgba(139,92,246,0.15)", label: "Elite Consistency" };
  if (s >= 7)
    return { color: "#7dd3fc", border: "rgba(56,189,248,0.3)", bg: "rgba(56,189,248,0.15)", label: "Weekly Warrior" };
  if (s >= 3)
    return { color: "#fb923c", border: "rgba(249,115,22,0.35)", bg: "rgba(249,115,22,0.15)", label: "Momentum" };
  return { color: "#fb923c", border: "rgba(249,115,22,0.25)", bg: "rgba(249,115,22,0.08)", label: "Getting started" };
}

// ── Plans definition (keeping DB Keys FREE, PREMIUM, PRO) ─────────────────────
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
    accent: "#00d084",
    accentBg: "rgba(0,208,132,0.1)",
    accentBorder: "rgba(0,208,132,0.3)",
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
    accentBorder: "rgba(245,158,11,0.35)",
    btnStyle: "amber" as const,
    features: ["Всё из Pro", "AI-тренер 24/7", "Рецепты под план", "Приоритетная поддержка", "Ранний доступ"],
  },
];

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const user = await prisma.users.findUnique({
    where: { id: currentUser.userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      gender: true,
      weight_start: true,
      weight_goal: true,
      daily_kcal_target: true,
      onboarding_completed: true,
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

  // ── Streak Calculation ─────────────────────────────────────────────────────
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

  // ── Calorie Stats ──────────────────────────────────────────────────────────
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

  // Ring SVG Dimensions (R=68, Size 170x170)
  const R = 68;
  const CIRC = 2 * Math.PI * R;
  const ringOffset = CIRC - (pct / 100) * CIRC;
  const ringColor = isOver ? "#ef4444" : pct >= 90 ? "#fb923c" : "#00d084";

  // Weight Progress
  const wStart = user.weight_start ? Number(user.weight_start) : 0;
  const wGoal = user.weight_goal ? Number(user.weight_goal) : 0;
  const wDiff = wStart - wGoal;
  const goalType = wDiff > 0 ? "lose" : wDiff < 0 ? "gain" : "maintain";

  // Subscription Status
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#04060f] dark:via-[#070a14] dark:to-[#020408] text-gray-900 dark:text-gray-100 pb-28 relative overflow-hidden">
      
      {/* ── Ambient Neon Glow Blobs ────────────────────────────────────── */}
      <div className="dash-ambient-green opacity-40 dark:opacity-100" aria-hidden />
      <div className="dash-ambient-purple opacity-40 dark:opacity-100" aria-hidden />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 transition-all border-b border-gray-200/50 dark:border-white/[0.04]"
        style={{
          background: "rgba(240,242,248,0.8)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <div
          className="absolute inset-0 hidden dark:block pointer-events-none"
          style={{
            background: "rgba(6,8,19,0.85)",
          }}
        />
        <div className="max-w-2xl mx-auto px-4 relative">
          <div className="flex items-center justify-between h-16">
            <Link href="/profile" className="flex items-center gap-3 min-w-0 group">
              {user.avatar ? (
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-[6px]" />
                  <img
                    src={user.avatar}
                    alt={user.name || ""}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-400/30 flex-shrink-0 relative z-10 transition-transform group-hover:scale-105"
                  />
                </div>
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 ring-2 ring-orange-400/20"
                  style={{ background: "linear-gradient(135deg, #fb923c, #ef4444)" }}
                >
                  {user.name?.[0]?.toUpperCase() || "У"}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[14px] font-black text-gray-900 dark:text-white truncate leading-tight font-display">
                  {user.name || "Профиль"}
                </p>
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 capitalize truncate mt-0.5">
                  {todayStr}
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-2 flex-shrink-0">
              <ThemeToggle />
              <LogoutButton className="border border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/20 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-black bg-gray-100/50 dark:bg-white/[0.04] transition-all active:scale-95 flex items-center gap-1.5 font-display font-display">
                Выйти
              </LogoutButton>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content wrapper ───────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4 relative z-10">

        {/* ── Streak Card ──────────────────────────────────────────────── */}
        <div
          className="dash-glass dash-enter rounded-3xl p-5 relative overflow-hidden border border-gray-200/50 dark:border-white/[0.06] bg-white/60 dark:bg-[#111424]/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
          style={{ "--enter-delay": "0.05s" } as React.CSSProperties}
        >
          {/* Accent radial glow inside card */}
          <div className="absolute top-[-40px] left-[-40px] w-44 h-44 bg-orange-500/10 dark:bg-orange-500/12 rounded-full blur-[50px] pointer-events-none" />

          <div className="relative z-10">
            {/* Header Labels */}
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-white/[0.04] pb-2.5">
              <span className="text-[10px] font-black tracking-widest text-orange-500 dark:text-orange-400 uppercase">
                🔥 УДАРНЫЙ РЕЖИМ
              </span>
              <span className="text-[10px] font-black tracking-widest text-gray-400 dark:text-gray-500 uppercase">
                ЭТА НЕДЕЛЯ
              </span>
            </div>

            {/* Streak Grid content */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              
              {/* Left Column: Number */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500/25 rounded-full blur-xl animate-pulse" />
                  <Flame className="relative w-12 h-12 text-orange-500 animate-bounce filter drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black font-display text-gray-950 dark:text-white leading-none tracking-tight">
                      {activeStreak}
                    </span>
                    <span className="text-xs font-black text-orange-500 dark:text-orange-400 uppercase tracking-wider font-display">
                      {activeStreak === 1 ? "день" : activeStreak <= 4 ? "дня" : "дней"}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-1">
                    🏆 Рекорд: {streak?.max_streak || 0} дн.
                  </p>
                </div>
              </div>

              {/* Middle Column: 7 Day Dots */}
              <div className="flex items-center gap-2 py-1">
                {last7Days.map(({ dateStr, label, isToday }) => {
                  const active = activeDays.has(dateStr);
                  return (
                    <div key={dateStr} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          active
                            ? isToday
                              ? "bg-gradient-to-br from-orange-400 to-red-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                              : "bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.35)]"
                            : isToday
                              ? "bg-gray-100 dark:bg-white/[0.04] border-2 border-dashed border-orange-400/70"
                              : "bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06]"
                        }`}
                      >
                        {active ? (
                          isToday ? (
                            <Flame className="w-4 h-4 text-white animate-pulse" />
                          ) : (
                            <Check className="w-4 h-4 text-white" strokeWidth={3.5} />
                          )
                        ) : (
                          <span className="text-[11px] font-black text-gray-300 dark:text-gray-600">-</span>
                        )}
                      </div>
                      <span className="text-[9px] font-extrabold text-gray-400 dark:text-gray-500 font-display">
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: CTA Badge & Micro Progress */}
              <div className="flex flex-col items-start sm:items-end flex-shrink-0">
                <div className="inline-flex items-center gap-1 text-[9px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-[0_2px_8px_rgba(16,185,129,0.1)]">
                  🏆 Не пропусти!
                </div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-2 uppercase tracking-wider font-display">
                  До 7 дней: {Math.max(0, 7 - activeDays.size)} осталось
                </p>
                <div className="w-24 h-1.5 bg-gray-100 dark:bg-white/[0.04] rounded-full overflow-hidden mt-1 border border-gray-200/20 dark:border-white/[0.02]">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                    style={{ width: `${Math.min(100, (activeDays.size / 7) * 100)}%` }}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── 2-Col Grid: Calories Today & Weight/Goal ───────────────── */}
        <div className="grid grid-cols-2 gap-3.5">

          {/* Left Column: Calories Today Card */}
          <div
            className="dash-glass dash-enter rounded-3xl p-5 relative overflow-hidden border border-gray-200/50 dark:border-white/[0.06] bg-white/60 dark:bg-[#111424]/40 flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
            style={{ "--enter-delay": "0.12s" } as React.CSSProperties}
          >
            {/* Subtle glow behind calories */}
            <div className="absolute bottom-[-40px] right-[-40px] w-36 h-34 bg-[#00d084]/8 dark:bg-[#00d084]/10 rounded-full blur-[40px] pointer-events-none" />

            <div className="relative z-10 flex-1 flex flex-col justify-between">
              {/* Header Info */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                    Калории сегодня
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-0.5">
                    {snapsCount} {snapsCount === 1 ? "запись" : snapsCount <= 4 ? "записи" : "записей"} за день
                  </p>
                </div>
                <span
                  className="text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                  style={
                    isOver
                      ? { background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }
                      : pct >= 90
                        ? { background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }
                        : { background: "rgba(0,208,132,0.1)", color: "#00d084", border: "1px solid rgba(0,208,132,0.2)" }
                  }
                >
                  {isOver ? "Превышение" : pct >= 90 ? "Почти норма" : "Почти норма"}
                </span>
              </div>

              {/* Progress SVG Ring */}
              <div className="flex justify-center my-3">
                <div className="relative">
                  <svg width="136" height="136" className="-rotate-90">
                    <circle
                      cx="68"
                      cy="68"
                      r={R}
                      fill="none"
                      strokeWidth="11"
                      className="stroke-gray-100 dark:stroke-white/5"
                    />
                    <circle
                      cx="68"
                      cy="68"
                      r={R}
                      fill="none"
                      strokeWidth="11"
                      strokeLinecap="round"
                      strokeDasharray={CIRC}
                      strokeDashoffset={ringOffset}
                      className="dash-ring transition-all duration-500"
                      style={{
                        stroke: ringColor,
                        filter: `drop-shadow(0 0 6px ${ringColor}60)`,
                        "--ring-from": String(Math.ceil(CIRC)),
                        "--ring-to": String(Math.round(ringOffset)),
                      } as React.CSSProperties}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black font-display text-gray-950 dark:text-white leading-none tracking-tight">
                      {consumed}
                    </span>
                    <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
                      из {dailyTarget}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detail Stats rows */}
              <div className="space-y-2.5 mt-2 border-t border-gray-100 dark:border-white/[0.04] pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00d084]" />
                    <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">Съедено</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-gray-950 dark:text-white font-display">
                      {consumed} <span className="text-[9px] font-normal text-gray-400">ккал</span>
                    </span>
                    <span className="text-[9px] font-black text-[#00d084] ml-1.5 bg-[#00d084]/10 px-1.5 py-0.5 rounded-md">
                      {pct}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#fb923c]" />
                    <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">Осталось</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-gray-950 dark:text-white font-display">
                      {remaining} <span className="text-[9px] font-normal text-gray-400">ккал</span>
                    </span>
                    <span className="text-[9px] font-black text-[#fb923c] ml-1.5 bg-[#fb923c]/10 px-1.5 py-0.5 rounded-md">
                      {Math.max(0, 100 - pct)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Big CTA Button inside card */}
              <Link
                href="/scan-food"
                className="mt-4 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-black text-xs font-black uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_6px_20px_rgba(0,208,132,0.3)] hover:shadow-[0_8px_25px_rgba(0,208,132,0.4)]"
                style={{
                  background: "linear-gradient(135deg, #00d084, #05e69e)",
                }}
              >
                <Camera className="w-4 h-4 text-black" strokeWidth={2.5} />
                Добавить прием пищи
              </Link>

            </div>
          </div>

          {/* Right Column: Weight & Goal */}
          <div className="space-y-3.5 flex flex-col">
            
            {/* 1. Current Weight Card */}
            <div
              className="dash-glass dash-enter rounded-3xl p-5 relative overflow-hidden border border-gray-200/50 dark:border-white/[0.06] bg-white/60 dark:bg-[#111424]/40 flex-1 flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
              style={{ "--enter-delay": "0.18s" } as React.CSSProperties}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                    Текущий вес
                  </p>
                  <Activity className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="font-display font-black text-gray-950 dark:text-white leading-none">
                  <span className="text-[34px] tracking-tight">{wStart ? wStart.toFixed(1) : "—"}</span>
                  <span className="text-sm font-black text-gray-400 dark:text-gray-500 ml-1">кг</span>
                </p>
              </div>

              {/* Sparkline Neon Weight Graph */}
              <div className="mt-4 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent blur-sm pointer-events-none" />
                <svg viewBox="0 0 100 32" className="w-full h-9" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d084" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#00d084" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,24 C10,24 15,16 25,15 C35,14 40,21 52,15 C64,10 70,8 82,7 C90,6 95,10 100,8"
                    fill="none"
                    stroke="#00d084"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 5px rgba(0,208,132,0.6))" }}
                  />
                  <path
                    d="M0,24 C10,24 15,16 25,15 C35,14 40,21 52,15 C64,10 70,8 82,7 C90,6 95,10 100,8 L100,32 L0,32 Z"
                    fill="url(#sparkGrad)"
                  />
                </svg>
              </div>
            </div>

            {/* 2. Goal Progress Card */}
            <div
              className="dash-glass dash-enter rounded-3xl p-5 relative overflow-hidden border border-gray-200/50 dark:border-white/[0.06] bg-white/60 dark:bg-[#111424]/40 flex-1 flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
              style={{ "--enter-delay": "0.22s" } as React.CSSProperties}
            >
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  {goalType === "lose" ? (
                    <TrendingDown className="w-4 h-4 text-orange-500" />
                  ) : goalType === "gain" ? (
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                  ) : (
                    <Target className="w-4 h-4 text-[#00d084]" />
                  )}
                  <p
                    className="text-[10px] font-black uppercase tracking-widest font-display"
                    style={{
                      color: goalType === "lose" ? "#f97316" : goalType === "gain" ? "#c084fc" : "#00d084",
                    }}
                  >
                    {goalType === "lose" ? "Похудение" : goalType === "gain" ? "Набор" : "Поддержание"}
                  </p>
                </div>
                <p className="font-display font-black text-gray-950 dark:text-white leading-none">
                  <span className="text-[28px] tracking-tight">{Math.abs(wDiff).toFixed(1)}</span>
                  <span className="text-xs font-black text-gray-400 dark:text-gray-500 ml-1">кг</span>
                </p>
                <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-1">
                  Цель: {wGoal.toFixed(1)} кг — отлично!
                </p>
              </div>

              {/* Progress Slider */}
              <div className="mt-3.5 pt-2 border-t border-gray-100 dark:border-white/[0.04]">
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wider font-display">
                  <span>Прогресс:</span>
                  <span style={{ color: goalType === "lose" ? "#f97316" : goalType === "gain" ? "#c084fc" : "#00d084" }}>
                    {goalType === "maintain" ? "100%" : "100%"}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden border border-gray-200/20 dark:border-white/[0.02]">
                  <div
                    className="h-full rounded-full dash-bar"
                    style={{
                      width: "100%",
                      background: goalType === "lose" ? "#f97316" : goalType === "gain" ? "#c084fc" : "#00d084",
                      boxShadow: `0 0 6px ${goalType === "lose" ? "#f9731650" : goalType === "gain" ? "#c084fc50" : "#00d08450"}`,
                      "--bar-delay": "0.6s",
                    } as React.CSSProperties}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Macro Nutrients Section (Three Columns) ────────────────── */}
        <div
          className="grid grid-cols-3 gap-2.5 dash-enter"
          style={{ "--enter-delay": "0.28s" } as React.CSSProperties}
        >
          {/* Proteins */}
          <div className="dash-glass rounded-2xl p-3.5 border border-gray-200/50 dark:border-white/[0.06] bg-white/60 dark:bg-[#111424]/40 shadow-[0_6px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1 min-w-0">
                <Beef className="w-3.5 h-3.5 text-[#00d084] flex-shrink-0" />
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate font-display">
                  Белки
                </p>
              </div>
              <span className="text-[9px] font-black text-[#00d084] font-display bg-[#00d084]/10 px-1.5 py-0.5 rounded-md">
                {proteinPct}%
              </span>
            </div>
            <div className="flex items-baseline gap-0.5 mb-2">
              <span className="text-[18px] font-black font-display text-gray-950 dark:text-white leading-none">
                {proteins.toFixed(0)}
              </span>
              <span className="text-[9px] font-medium text-gray-400 dark:text-gray-500 font-display">/{proteinTarget}г</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full dash-bar"
                style={{
                  width: `${proteinPct}%`,
                  background: "linear-gradient(90deg, #00d084, #05e69e)",
                  boxShadow: "0 0 6px rgba(0,208,132,0.4)",
                  "--bar-delay": "0.5s",
                } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Fats */}
          <div className="dash-glass rounded-2xl p-3.5 border border-gray-200/50 dark:border-white/[0.06] bg-white/60 dark:bg-[#111424]/40 shadow-[0_6px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1 min-w-0">
                <Droplet className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate font-display">
                  Жиры
                </p>
              </div>
              <span className="text-[9px] font-black text-orange-500 font-display bg-orange-500/10 px-1.5 py-0.5 rounded-md">
                {fatPct}%
              </span>
            </div>
            <div className="flex items-baseline gap-0.5 mb-2">
              <span className="text-[18px] font-black font-display text-gray-950 dark:text-white leading-none">
                {fats.toFixed(0)}
              </span>
              <span className="text-[9px] font-medium text-gray-400 dark:text-gray-500 font-display">/{fatTarget}г</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full dash-bar"
                style={{
                  width: `${fatPct}%`,
                  background: "linear-gradient(90deg, #fb923c, #f97316)",
                  boxShadow: "0 0 6px rgba(249,115,22,0.4)",
                  "--bar-delay": "0.62s",
                } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="dash-glass rounded-2xl p-3.5 border border-gray-200/50 dark:border-white/[0.06] bg-white/60 dark:bg-[#111424]/40 shadow-[0_6px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1 min-w-0">
                <Wheat className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate font-display">
                  Углеводы
                </p>
              </div>
              <span className="text-[9px] font-black text-purple-400 font-display bg-purple-500/10 px-1.5 py-0.5 rounded-md">
                {carbPct}%
              </span>
            </div>
            <div className="flex items-baseline gap-0.5 mb-2">
              <span className="text-[18px] font-black font-display text-gray-950 dark:text-white leading-none">
                {carbs.toFixed(0)}
              </span>
              <span className="text-[9px] font-medium text-gray-400 dark:text-gray-500 font-display">/{carbTarget}г</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full dash-bar"
                style={{
                  width: `${carbPct}%`,
                  background: "linear-gradient(90deg, #c084fc, #8b5cf6)",
                  boxShadow: "0 0 6px rgba(139,92,246,0.4)",
                  "--bar-delay": "0.74s",
                } as React.CSSProperties}
              />
            </div>
          </div>
        </div>

        {/* ── Today's Meals Section ───────────────────────────────────── */}
        <div
          className="dash-glass dash-enter rounded-3xl overflow-hidden border border-gray-200/50 dark:border-white/[0.06] bg-white/60 dark:bg-[#111424]/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
          style={{ "--enter-delay": "0.35s" } as React.CSSProperties}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
          >
            <div>
              <h3 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-wider">
                Сегодняшние приемы пищи
              </h3>
              <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-0.5">
                {recentMeals.length > 0 ? "Последние записи за день" : "Записей пока нет"}
              </p>
            </div>
            <Link
              href="/meal-history"
              className="flex items-center gap-0.5 text-xs font-black text-[#00d084] hover:text-[#00e890] transition-colors uppercase tracking-wider font-display"
            >
              Вся история <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentMeals.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {recentMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                >
                  <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-white/5 ring-1 ring-gray-200/20 dark:ring-white/[0.05]">
                    <img src={meal.image_url} alt={meal.dish_name || "Meal"} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {meal.dish_name || "Без названия"}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      🕒{" "}
                      {new Date(meal.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-black font-display text-gray-950 dark:text-white leading-none">
                      {meal.calories || 0}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider">
                      ккал
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <div
                className="w-14 h-12.5 rounded-2xl flex items-center justify-center mx-auto mb-3.5"
                style={{ background: "rgba(0,208,132,0.08)" }}
              >
                <Camera className="w-7 h-7 text-[#00d084]" />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-1 font-display">
                Начните отслеживать питание
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-5 font-display">
                Сфотографируйте еду — AI рассчитает калории
              </p>
              <Link
                href="/scan-food"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-black text-xs font-black uppercase tracking-wider font-display"
                style={{ background: "linear-gradient(135deg, #00d084, #05e69e)" }}
              >
                <Camera className="w-4 h-4 text-black" strokeWidth={2.5} />
                Сделать первое фото
              </Link>
            </div>
          )}
        </div>

        {/* ── Choose Plan Section (Tariffs) ───────────────────────────── */}
        <div className="dash-enter pt-2" style={{ "--enter-delay": "0.42s" } as React.CSSProperties}>
          
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4 px-0.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                + ТАРИФЫ
              </span>
            </div>
            <span
              className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider font-display"
              style={{
                background: "rgba(0,208,132,0.1)",
                color: "#00d084",
                border: "1px solid rgba(0,208,132,0.2)",
              }}
            >
              {trialDaysLeft !== null ? `Пробный: ${trialDaysLeft} дн.` : `Сейчас: ${currentPlan}`}
            </span>
          </div>

          <h2 className="text-2xl font-black font-display text-gray-950 dark:text-white mb-5 px-0.5">
            Выбери свой <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">план</span>
          </h2>

          {/* Plans — 3 columns grid, exact screenshot design */}
          <div className="grid grid-cols-3 gap-3">
            {PLANS.map((plan) => {
              const Icon = plan.Icon;
              const isCurrent = currentPlan?.toUpperCase() === plan.key;

              const bgStyle =
                plan.key === "FREE"
                  ? "rgba(255,255,255,0.03)"
                  : plan.key === "PREMIUM"
                    ? "linear-gradient(180deg, rgba(0,208,132,0.06), rgba(0,208,132,0.01))"
                    : "linear-gradient(180deg, rgba(245,158,11,0.07), rgba(245,158,11,0.02))";

              const borderStyle =
                plan.key === "FREE"
                  ? "rgba(255,255,255,0.06)"
                  : plan.key === "PREMIUM"
                    ? "rgba(0,208,132,0.25)"
                    : "rgba(245,158,11,0.25)";

              return (
                <div
                  key={plan.key}
                  className="rounded-3xl overflow-hidden relative flex flex-col"
                  style={{
                    background: bgStyle,
                    border: `1px solid ${borderStyle}`,
                    boxShadow: plan.key !== "FREE" ? `0 0 30px ${plan.accentBg}` : undefined,
                  }}
                >
                  <div className="relative p-4 flex flex-col h-full z-10">
                    {/* Badge */}
                    {plan.badge ? (
                      <div
                        className="self-start text-[9px] font-black px-2 py-0.5 rounded-full mb-3 tracking-wider uppercase inline-flex items-center gap-1"
                        style={{
                          background: plan.accentBg,
                          color: plan.accent,
                          border: `1px solid ${plan.accentBorder}`,
                        }}
                      >
                        <Zap className="w-2.5 h-2.5" /> {plan.badge}
                      </div>
                    ) : (
                      <div className="h-5 mb-3" />
                    )}

                    {/* Icon + Name */}
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: plan.accentBg }}
                      >
                        <Icon className="w-4 h-4" style={{ color: plan.accent }} />
                      </div>
                      <p className="text-sm font-black font-display text-white">
                        {plan.name}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-3">
                      {plan.price ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black font-display text-white leading-none">
                            {plan.price}
                          </span>
                          <span className="text-[9px] font-bold text-gray-500 uppercase">
                            сом<br/>/ мес
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-gray-500">0 сом</span>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="w-full h-px bg-white/[0.04] mb-3" />

                    {/* Features — vertical list */}
                    <div className="space-y-2 mb-4 flex-1">
                      {plan.features.map((f) => (
                        <div key={f} className="flex items-start gap-2">
                          {f.startsWith("Без") ? (
                            <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-1.5 h-0.5 bg-gray-500 rounded-full" />
                            </div>
                          ) : (
                            <div
                              className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ background: plan.accentBg }}
                            >
                              <Check className="w-2.5 h-2.5" style={{ color: plan.accent }} strokeWidth={4} />
                            </div>
                          )}
                          <p className="text-[11px] text-gray-400 leading-tight">{f}</p>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/subscription?plan=${plan.key.toLowerCase()}`}
                      className="w-full py-2.5 rounded-xl text-[10px] font-black text-center uppercase tracking-wider transition-all active:scale-95 hover:opacity-90 font-display"
                      style={
                        isCurrent
                          ? {
                              background: "transparent",
                              color: "#6b7280",
                              border: "1px solid rgba(255,255,255,0.1)",
                            }
                          : plan.btnStyle === "green"
                            ? {
                                background: "#00d084",
                                color: "#000",
                                boxShadow: "0 4px 16px rgba(0,208,132,0.35)",
                              }
                            : plan.btnStyle === "amber"
                              ? {
                                  background: "#f59e0b",
                                  color: "#fff",
                                  boxShadow: "0 4px 16px rgba(245,158,11,0.35)",
                                }
                              : {
                                  background: "transparent",
                                  color: "#6b7280",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                }
                      }
                    >
                      {isCurrent ? "Текущий план" : plan.key === "PREMIUM" ? "Перейти на Pro >" : plan.key === "PRO" ? "Получить Premium >" : "Начать бесплатно"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-[10px] font-bold text-gray-500 mt-3 uppercase tracking-widest font-display">
            Безопасная оплата · Отмена в любое время · Без скрытых платежей
          </p>
        </div>

      </main>

      {/* ── Fixed Bottom Actions Navigation Bar ──────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200/50 dark:border-white/[0.04]"
        style={{
          background: "rgba(240,242,248,0.9)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <div
          className="absolute inset-0 hidden dark:block pointer-events-none"
          style={{
            background: "rgba(6,8,19,0.9)",
          }}
        />
        <div className="max-w-2xl mx-auto px-4 py-3 grid grid-cols-2 gap-3 relative">
          
          {/* Quick Scanner Action */}
          <Link
            href="/scan-food"
            className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 active:scale-95 hover:opacity-90 hover:scale-[1.01]"
            style={{
              background: "linear-gradient(135deg, #00d084, #05e69e)",
              boxShadow: "0 4px 20px rgba(0,208,132,0.25)",
            }}
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Camera className="w-5.5 h-5.5 text-black" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-black leading-tight uppercase tracking-wide font-display">
                Сканировать еду
              </p>
              <p className="text-[10px] font-bold text-black/70 truncate mt-0.5 uppercase tracking-wide font-display">
                {snapsCount > 0
                  ? `${snapsCount} ${snapsCount === 1 ? "снап" : snapsCount <= 4 ? "снапа" : "снапов"} сегодня`
                  : "AI анализ за секунды"}
              </p>
            </div>
          </Link>

          {/* Quick History Action */}
          <Link
            href="/meal-history"
            className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 active:scale-95 hover:opacity-90 hover:scale-[1.01] border border-gray-200 dark:border-white/[0.08]"
            style={{
              background: "rgba(99,102,241,0.06)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(99,102,241,0.12)" }}
            >
              <History className="w-5.5 h-5.5" style={{ color: "#818cf8" }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-gray-950 dark:text-white leading-tight uppercase tracking-wide font-display">
                История питания
              </p>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 truncate mt-0.5 uppercase tracking-wide font-display">
                Все записи и статистика
              </p>
            </div>
          </Link>

        </div>
      </nav>
    </div>
  );
}
