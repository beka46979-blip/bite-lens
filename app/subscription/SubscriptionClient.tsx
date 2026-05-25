"use client";

import { useSearchParams } from "next/navigation";
import { ArrowLeft, Zap, Crown, Check, Clock, Shield, Star } from "lucide-react";
import Link from "next/link";
import { Suspense, useState } from "react";

interface Props {
  currentStatus: string | null;
  currentPlan: string | null;
  trialDaysLeft: number | null;
  userId: string;
}

const PLANS = [
  {
    key: "premium",
    icon: Zap,
    name: "Premium",
    price: "$4.99",
    period: "/mo",
    color: "#39d98a",
    colorBg: "rgba(57,217,138,0.08)",
    colorBorder: "rgba(57,217,138,0.3)",
    buttonBg: "linear-gradient(135deg, #39d98a, #059669)",
    buttonColor: "#000",
    features: [
      "10 снапов в день",
      "Быстрый AI-анализ",
      "Полная история питания",
      "Детальный разбор БЖУ",
      "Стрик-система",
    ],
    badge: null,
  },
  {
    key: "pro",
    icon: Crown,
    name: "Pro",
    price: "$9.99",
    period: "/mo",
    color: "#a78bfa",
    colorBg: "rgba(139,92,246,0.08)",
    colorBorder: "rgba(139,92,246,0.35)",
    buttonBg: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    buttonColor: "#fff",
    features: [
      "Безлимитные снапы",
      "Максимальная точность AI",
      "Личный AI-тренер",
      "Планирование питания",
      "Ранний доступ к функциям",
    ],
    badge: "ЛУЧШИЙ ВЫБОР",
  },
];

function SubscriptionInner({ currentStatus, currentPlan, trialDaysLeft }: Props) {
  const searchParams = useSearchParams();
  const highlightPlan = searchParams.get("plan");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePayment = async (planKey: string) => {
    setLoadingPlan(planKey);
    setPaymentError(null);
    try {
      const response = await fetch('/api/finik/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: planKey }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Ошибка создания платежа');
      }
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Не получен URL платежной страницы');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setLoadingPlan(null);
    }
  };

  const isActive = currentStatus === "ACTIVE";
  const isTrial = currentStatus === "TRIAL";

  return (
    <div
      className="min-h-screen"
      style={{ background: "#080b14", color: "#fff" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "rgba(8,11,20,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-70"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
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

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-12">

        {/* Trial status banner */}
        {isTrial && trialDaysLeft !== null && (
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              background:
                trialDaysLeft <= 1
                  ? "rgba(239,68,68,0.1)"
                  : "rgba(251,191,36,0.1)",
              border: `1px solid ${trialDaysLeft <= 1 ? "rgba(239,68,68,0.3)" : "rgba(251,191,36,0.3)"}`,
            }}
          >
            <Clock
              className="w-5 h-5 flex-shrink-0"
              style={{ color: trialDaysLeft <= 1 ? "#f87171" : "#fbbf24" }}
            />
            <div>
              <p
                className="text-sm font-bold"
                style={{ color: trialDaysLeft <= 1 ? "#f87171" : "#fbbf24" }}
              >
                {trialDaysLeft === 0
                  ? "Пробный период истёк"
                  : trialDaysLeft === 1
                  ? "Последний день пробного периода"
                  : `${trialDaysLeft} ${trialDaysLeft === 2 || trialDaysLeft === 3 || trialDaysLeft === 4 ? "дня" : "дней"} пробного периода`}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                Оформи подписку, чтобы не потерять прогресс
              </p>
            </div>
          </div>
        )}

        {/* Active plan status */}
        {isActive && (
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              background: "rgba(57,217,138,0.08)",
              border: "1px solid rgba(57,217,138,0.25)",
            }}
          >
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
        <div className="text-center pt-2 pb-1">
          <div className="text-5xl mb-3">🚀</div>
          <h2 className="text-2xl font-black text-white">
            Начни контролировать питание
          </h2>
          <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.45)" }}>
            Выбери план и получи полный доступ
          </p>
        </div>

        {/* Plan cards */}
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isHighlighted = highlightPlan === plan.key;
          const isCurrent = isActive && currentPlan?.toUpperCase() === plan.key.toUpperCase();

          return (
            <div
              key={plan.key}
              className="rounded-2xl overflow-hidden"
              style={{
                background: plan.colorBg,
                border: `1.5px solid ${isHighlighted ? plan.color : plan.colorBorder}`,
                boxShadow: isHighlighted ? `0 0 32px ${plan.colorBg}` : undefined,
              }}
            >
              {/* Card header */}
              <div
                className="px-5 py-4 flex items-center gap-3"
                style={{ borderBottom: `1px solid ${plan.colorBorder}` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: plan.colorBg, border: `1px solid ${plan.colorBorder}` }}
                >
                  <Icon className="w-5 h-5" style={{ color: plan.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-black text-white">{plan.name}</p>
                    {plan.badge && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider"
                        style={{
                          background: plan.colorBg,
                          color: plan.color,
                          border: `1px solid ${plan.colorBorder}`,
                        }}
                      >
                        {plan.badge}
                      </span>
                    )}
                    {isCurrent && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-black"
                        style={{ background: "rgba(57,217,138,0.15)", color: "#39d98a" }}
                      >
                        ТЕКУЩИЙ
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {plan.key === "pro" ? "Полный контроль над питанием" : "Ежедневный трекинг питания"}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-2xl font-black text-white">{plan.price}</span>
                  <span className="text-xs ml-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {plan.period}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="px-5 py-4 space-y-2.5">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: plan.colorBg, border: `1px solid ${plan.colorBorder}` }}
                    >
                      <Check className="w-3 h-3" style={{ color: plan.color }} />
                    </div>
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="px-5 pb-5">
                <button
                  onClick={() => handlePayment(plan.key)}
                  disabled={isCurrent || loadingPlan !== null}
                  className="w-full py-3.5 rounded-xl text-sm font-black transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: plan.buttonBg, color: plan.buttonColor }}
                >
                  {loadingPlan === plan.key
                    ? "Создание платежа..."
                    : isCurrent
                    ? "Активный план"
                    : plan.key === "pro"
                    ? "Оформить Pro — Безлимит 👑"
                    : "Оформить Premium ⚡"}
                </button>
              </div>
            </div>
          );
        })}

        {/* Payment error */}
        {paymentError && (
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <p className="text-sm" style={{ color: "#f87171" }}>
              {paymentError}
            </p>
          </div>
        )}

        {/* Free tier note */}
        <div
          className="rounded-2xl p-4 text-center"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            Все планы включают 7-дневную гарантию возврата средств
          </p>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.15)" }}>
            Безопасная оплата · Отмена в любое время
          </p>
        </div>

        {/* Why Bite Lens */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
            <Star className="w-4 h-4" style={{ color: "#fbbf24" }} />
            Почему Bite Lens?
          </h3>
          <div className="space-y-2">
            {[
              "🔥 AI-распознавание блюд Кыргызстана, Казахстана, Узбекистана",
              "📊 Точный подсчёт КБЖУ по фото",
              "🏆 Стрик-система для мотивации",
              "📱 Работает без подключения к интернету (история)",
            ].map((item) => (
              <p key={item} className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
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
