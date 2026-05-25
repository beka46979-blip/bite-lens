"use client";

import { useRouter } from "next/navigation";
import { X, Zap, Crown, Check, Lock, Camera, Clock, AlertTriangle } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
export type PaywallReason = "trial_expired" | "limit_reached" | "no_subscription";

interface Props {
  reason: PaywallReason;
  snapsUsed?: number;
  dailyLimit?: number;
  trialDaysLeft?: number;
  onClose?: () => void;
}

// ── Plan cards data ────────────────────────────────────────────────────────────
const PLANS = [
  {
    key: "premium",
    icon: Zap,
    emoji: "⚡",
    name: "Premium",
    tagline: "More snaps daily",
    price: "$4.99",
    period: "/mo",
    color: "#39d98a",
    colorBg: "rgba(57,217,138,0.1)",
    colorBorder: "rgba(57,217,138,0.35)",
    buttonBg: "linear-gradient(135deg, #39d98a, #059669)",
    buttonText: "#000",
    features: ["10 snaps / day", "Fast AI analysis", "Full history", "Nutrition insights"],
    badge: null,
  },
  {
    key: "pro",
    icon: Crown,
    emoji: "👑",
    name: "Pro",
    tagline: "Unlimited everything",
    price: "$9.99",
    period: "/mo",
    color: "#a78bfa",
    colorBg: "rgba(139,92,246,0.1)",
    colorBorder: "rgba(139,92,246,0.4)",
    buttonBg: "linear-gradient(135deg, #7c3aed, #5b21b6)",
    buttonText: "#fff",
    features: ["Unlimited snaps", "Best AI accuracy", "Personal AI coach", "Early features"],
    badge: "BEST VALUE",
  },
];

// ── Header content by reason ───────────────────────────────────────────────────
function Header({ reason, snapsUsed, dailyLimit, trialDaysLeft }: Omit<Props, "onClose">) {
  if (reason === "limit_reached")
    return (
      <>
        <div className="text-4xl mb-3 leading-none">⚡</div>
        <h2 className="text-xl font-black text-white">Daily limit reached</h2>
        <p className="text-sm mt-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
          {snapsUsed ?? 0}/{dailyLimit ?? 3} snaps used today
        </p>
        <div
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: "rgba(249,115,22,0.12)", color: "#f97316", border: "1px solid rgba(249,115,22,0.3)" }}
        >
          <Camera className="w-3 h-3" /> Upgrade for more snaps
        </div>
      </>
    );

  if (reason === "trial_expired" && trialDaysLeft === 0)
    return (
      <>
        <div className="text-4xl mb-3 leading-none">🚀</div>
        <h2 className="text-xl font-black text-white">Continue your journey</h2>
        <p className="text-sm mt-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
          Your free trial has ended
        </p>
        <div
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
        >
          <Lock className="w-3 h-3" /> Access locked
        </div>
      </>
    );

  // trial warning (days left > 0)
  return (
    <>
      <div className="text-4xl mb-3 leading-none">⏳</div>
      <h2 className="text-xl font-black text-white">
        {trialDaysLeft === 1 ? "1 day left" : `${trialDaysLeft} days left`} in trial
      </h2>
      <p className="text-sm mt-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
        🔥 Don't lose your streak progress
      </p>
      <div
        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
        style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}
      >
        <Clock className="w-3 h-3" /> Upgrade to keep your streak alive
      </div>
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function PaywallModal({ reason, snapsUsed, dailyLimit, trialDaysLeft, onClose }: Props) {
  const router = useRouter();
  const isHardBlock = reason === "trial_expired" || reason === "no_subscription";
  const canDismiss = !isHardBlock && !!onClose;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center"
      style={{
        background: isHardBlock ? "rgba(0,0,0,0.96)" : "rgba(0,0,0,0.82)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
      onClick={canDismiss ? onClose : undefined}
    >
      {/* Card */}
      <div
        className="w-full max-w-md mx-0 sm:mx-4 rounded-t-[28px] sm:rounded-[28px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0b0c1a",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 -20px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {/* Glow top */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-48 h-1 rounded-full blur-sm -mt-0.5 pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(57,217,138,0.5), transparent)" }}
        />

        {/* Drag handle on mobile */}
        <div className="flex justify-center pt-3 pb-0 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        </div>

        {/* Header section */}
        <div
          className="px-6 pt-5 pb-5 text-center relative"
          style={{ background: "linear-gradient(180deg, rgba(57,217,138,0.06) 0%, transparent 100%)" }}
        >
          {canDismiss && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          )}
          <Header
            reason={reason}
            snapsUsed={snapsUsed}
            dailyLimit={dailyLimit}
            trialDaysLeft={trialDaysLeft}
          />
        </div>

        {/* Divider */}
        <div className="h-px mx-6" style={{ background: "rgba(255,255,255,0.05)" }} />

        {/* Plans */}
        <div className="px-4 py-4 space-y-3">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.key}
                className="rounded-2xl p-4 relative overflow-hidden"
                style={{
                  background: plan.colorBg,
                  border: `1px solid ${plan.colorBorder}`,
                }}
              >
                {plan.badge && (
                  <div
                    className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider"
                    style={{ background: `${plan.colorBg}`, color: plan.color, border: `1px solid ${plan.colorBorder}` }}
                  >
                    {plan.badge}
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${plan.colorBg}`, border: `1px solid ${plan.colorBorder}` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: plan.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-black text-white">{plan.name}</p>
                    </div>
                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {plan.tagline}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xl font-black text-white">{plan.price}</span>
                    <span className="text-[11px] ml-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-1 mb-3">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 flex-shrink-0" style={{ color: plan.color }} />
                      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => router.push(`/subscription?plan=${plan.key}`)}
                  className="w-full py-2.5 rounded-xl text-sm font-black transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: plan.buttonBg, color: plan.buttonText }}
                >
                  {plan.key === "pro" ? "Go Pro — Unlimited 🚀" : "Upgrade to Premium ⚡"}
                </button>
              </div>
            );
          })}

          {/* Dismiss CTA */}
          {canDismiss ? (
            <button
              onClick={onClose}
              className="w-full py-2.5 text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Come back tomorrow
            </button>
          ) : (
            <p className="text-center text-[11px] py-1" style={{ color: "rgba(255,255,255,0.2)" }}>
              Secure payment · Cancel anytime
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
