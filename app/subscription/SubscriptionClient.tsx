"use client";

import { useSearchParams } from "next/navigation";
import { ArrowLeft, Zap, Crown, Check, Clock, Shield, Star, Leaf } from "lucide-react";
import Link from "next/link";
import { Suspense, useState } from "react";

interface Props {
  currentStatus: string | null;
  currentPlan:   string | null;
  trialDaysLeft: number | null;
  userId:        string;
}

// ── price table ───────────────────────────────────────────────────────────────
const PRICES = {
  premium: { monthly: { display: "4.99", label: "/месяц" }, yearly: { display: "3.49", label: "/месяц" } },
  pro:     { monthly: { display: "9.99", label: "/месяц" }, yearly: { display: "6.99", label: "/месяц" } },
};

// ── inner component ───────────────────────────────────────────────────────────
function SubscriptionInner({ currentStatus, currentPlan, trialDaysLeft }: Props) {
  const searchParams  = useSearchParams();
  const highlightPlan = searchParams.get("plan");

  const [loadingPlan,  setLoadingPlan]  = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [billing,      setBilling]      = useState<"monthly" | "yearly">("monthly");

  const handlePayment = async (planKey: string) => {
    if (planKey === "free") { window.location.href = "/dashboard"; return; }
    setLoadingPlan(planKey);
    setPaymentError(null);
    try {
      const res  = await fetch("/api/finik/create-payment", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ planType: planKey, billingPeriod: billing }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || "Ошибка создания платежа");
      if (data.paymentUrl) { window.location.href = data.paymentUrl; }
      else throw new Error("Не получен URL платежной страницы");
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Неизвестная ошибка");
      setLoadingPlan(null);
    }
  };

  const isActive = currentStatus === "ACTIVE";
  const isTrial  = currentStatus === "TRIAL";

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: "#080b14", color: "#fff" }}>

      {/* ── Ambient orbs ─────────────────────────────────────────────────── */}
      <div className="absolute top-[-10%] left-[-25%] w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)", filter: "blur(48px)" }} />
      <div className="absolute top-[30%] right-[-25%] w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.14) 0%, transparent 70%)", filter: "blur(48px)" }} />
      <div className="absolute bottom-[10%] left-[-15%] w-72 h-72 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)", filter: "blur(48px)" }} />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40" style={{
        background: "rgba(8,11,20,0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center gap-3">
          <Link href="/dashboard"
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-70"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <ArrowLeft className="w-4 h-4 text-white/70" />
          </Link>
          <div>
            <h1 className="text-[15px] font-black text-white leading-tight">Подписка</h1>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
              Разблокируй весь потенциал Bite Lens
            </p>
          </div>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="max-w-lg mx-auto px-4 pt-8 pb-16 space-y-4 relative z-10">

        {/* Trial banner */}
        {isTrial && trialDaysLeft !== null && (
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{
            background: trialDaysLeft <= 1 ? "rgba(239,68,68,0.1)" : "rgba(251,191,36,0.1)",
            border: `1px solid ${trialDaysLeft <= 1 ? "rgba(239,68,68,0.3)" : "rgba(251,191,36,0.3)"}`,
          }}>
            <Clock className="w-5 h-5 flex-shrink-0"
              style={{ color: trialDaysLeft <= 1 ? "#f87171" : "#fbbf24" }} />
            <div>
              <p className="text-sm font-bold"
                style={{ color: trialDaysLeft <= 1 ? "#f87171" : "#fbbf24" }}>
                {trialDaysLeft === 0
                  ? "Пробный период истёк"
                  : trialDaysLeft === 1
                  ? "Последний день пробного периода"
                  : `${trialDaysLeft} ${[2,3,4].includes(trialDaysLeft) ? "дня" : "дней"} пробного периода`}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                Оформи подписку, чтобы не потерять прогресс
              </p>
            </div>
          </div>
        )}

        {/* Active plan banner */}
        {isActive && (
          <div className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: "rgba(57,217,138,0.08)", border: "1px solid rgba(57,217,138,0.25)" }}>
            <Shield className="w-5 h-5 flex-shrink-0" style={{ color: "#39d98a" }} />
            <div>
              <p className="text-sm font-bold" style={{ color: "#39d98a" }}>
                Активная подписка: {currentPlan}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                Все функции разблокированы
              </p>
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="text-center pb-1">
          <div className="text-5xl mb-4 inline-block" style={{ animation: "rocketFloat 3s ease-in-out infinite" }}>🚀</div>
          <h2 className="text-[28px] font-black text-white leading-tight mb-2">
            Начни контролировать<br />своё питание
          </h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            Выбери план и получи полный доступ<br />к умному трекеру калорий
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center">
          <div className="flex items-center gap-1 p-1 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <button onClick={() => setBilling("monthly")}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
              style={billing === "monthly"
                ? { background: "rgba(255,255,255,0.12)", color: "#fff" }
                : { color: "rgba(255,255,255,0.4)" }}>
              Ежемесячно
            </button>
            <button onClick={() => setBilling("yearly")}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all"
              style={billing === "yearly"
                ? { background: "rgba(255,255,255,0.12)", color: "#fff" }
                : { color: "rgba(255,255,255,0.4)" }}>
              Ежегодно
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black"
                style={{ background: "rgba(16,185,129,0.2)", color: "#39d98a", border: "1px solid rgba(16,185,129,0.3)" }}>
                −30%
              </span>
            </button>
          </div>
        </div>

        {/* ── Premium card ─────────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(249,115,22,0.06)", border: `1.5px solid ${highlightPlan === "premium" ? "#f97316" : "rgba(249,115,22,0.25)"}` }}>
          {/* header row */}
          <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(249,115,22,0.12)" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)" }}>
              <Zap className="w-5 h-5" style={{ color: "#f97316" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-black text-white">Premium</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Ежедневный трекинг питания</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-start leading-none">
                <span className="text-sm font-bold pt-1 mr-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>$</span>
                <span className="text-4xl font-black text-white">{PRICES.premium[billing].display}</span>
              </div>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>{PRICES.premium[billing].label}</p>
            </div>
          </div>
          {/* features */}
          <div className="px-5 py-4 space-y-2.5">
            {["10 снапов в день", "Быстрый AI-анализ блюд", "Полная история питания", "Детальный разбор БЖУ", "Стрик-система мотивации"].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#39d98a" }} />
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{f}</span>
              </div>
            ))}
          </div>
          {/* cta */}
          <div className="px-5 pb-5">
            <button onClick={() => handlePayment("premium")} disabled={loadingPlan !== null}
              className="w-full py-4 rounded-xl text-sm font-black transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff" }}>
              {loadingPlan === "premium" ? "Создание платежа..." : "Оформить Premium ↓"}
            </button>
          </div>
        </div>

        {/* ── Pro card ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden relative"
          style={{
            background: "rgba(139,92,246,0.08)",
            border: `1.5px solid ${highlightPlan === "pro" ? "#a78bfa" : "rgba(139,92,246,0.45)"}`,
            boxShadow: "0 0 48px rgba(139,92,246,0.14)",
          }}>
          {/* best choice badge */}
          <div className="absolute top-3.5 right-4 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black"
            style={{ background: "rgba(139,92,246,0.25)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.4)" }}>
            ★ ЛУЧШИЙ ВЫБОР
          </div>
          {/* header row */}
          <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(139,92,246,0.18)" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)" }}>
              <Crown className="w-5 h-5" style={{ color: "#a78bfa" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-black text-white">Pro</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Полный контроль над питанием</p>
            </div>
            <div className="text-right flex-shrink-0 pr-2">
              <div className="flex items-start leading-none">
                <span className="text-sm font-bold pt-1 mr-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>$</span>
                <span className="text-4xl font-black text-white">{PRICES.pro[billing].display}</span>
              </div>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>{PRICES.pro[billing].label}</p>
            </div>
          </div>
          {/* features */}
          <div className="px-5 py-4 space-y-2.5">
            {[
              "Безлимитные снапы",
              "Максимальная точность AI",
              "Личный AI-тренер",
              "Планирование питания на неделю",
              "Ранний доступ к функциям",
              "Приоритетная поддержка 24/7",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#a78bfa" }} />
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>{f}</span>
              </div>
            ))}
          </div>
          {/* cta */}
          <div className="px-5 pb-5">
            <button onClick={() => handlePayment("pro")} disabled={loadingPlan !== null}
              className="w-full py-4 rounded-xl text-sm font-black transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "#fff" }}>
              {loadingPlan === "pro" ? "Создание платежа..." : "Оформить Pro 👑"}
            </button>
          </div>
        </div>

        {/* ── Divider ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          <span className="text-xs whitespace-nowrap" style={{ color: "rgba(255,255,255,0.2)" }}>
            или начни без оплаты
          </span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
        </div>

        {/* ── Free card ────────────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <Leaf className="w-5 h-5" style={{ color: "#10b981" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-black text-white">Бесплатно</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Базовые возможности</p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-4xl font-black text-white leading-none">$0</span>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>навсегда</p>
            </div>
          </div>
          <div className="px-5 py-4 space-y-2.5">
            {["3 снапа в день", "Базовый подсчёт калорий"].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <Check className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{f}</span>
              </div>
            ))}
          </div>
          <div className="px-5 pb-5">
            <button onClick={() => { window.location.href = "/dashboard"; }}
              className="w-full py-4 rounded-xl text-sm font-semibold transition-all hover:opacity-80 active:scale-[0.98]"
              style={{ background: "transparent", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}>
              Продолжить бесплатно
            </button>
          </div>
        </div>

        {/* ── Payment error ─────────────────────────────────────────────── */}
        {paymentError && (
          <div className="rounded-2xl p-4"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <p className="text-sm" style={{ color: "#f87171" }}>{paymentError}</p>
          </div>
        )}

        {/* ── Trust line ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-5 flex-wrap pt-1">
          {[
            { icon: <Shield className="w-3.5 h-3.5" />, text: "Безопасная оплата" },
            { icon: <Check  className="w-3.5 h-3.5" />, text: "Отмена в любой момент" },
            { icon: <Star   className="w-3.5 h-3.5" />, text: "4.8 в App Store" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>
              {icon} {text}
            </div>
          ))}
        </div>
      </div>

      {/* ── Rocket float keyframe ─────────────────────────────────────────── */}
      <style>{`
        @keyframes rocketFloat {
          0%, 100% { transform: translateY(0px) rotate(-5deg); }
          50%       { transform: translateY(-10px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}

export function SubscriptionClient(props: Props) {
  return (
    <Suspense fallback={null}>
      <SubscriptionInner {...props} />
    </Suspense>
  );
}
