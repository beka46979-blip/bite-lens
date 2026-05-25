"use client";

import { useEffect, useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Props {
  streak: number;
  onDone: () => void;
}

// ── Particles config ───────────────────────────────────────────────────────────
const PARTICLES = [
  { top: "11%", left: "8%",  size: 8,  delay: 0.00, dy: -50 },
  { top: "16%", left: "87%", size: 10, delay: 0.10, dy: -42 },
  { top: "66%", left: "5%",  size: 5,  delay: 0.20, dy: -55 },
  { top: "73%", left: "91%", size: 8,  delay: 0.14, dy: -38 },
  { top: "40%", left: "2%",  size: 4,  delay: 0.28, dy: -60 },
  { top: "52%", left: "95%", size: 5,  delay: 0.22, dy: -45 },
  { top: "84%", left: "22%", size: 7,  delay: 0.06, dy: -48 },
  { top: "7%",  left: "58%", size: 4,  delay: 0.18, dy: -52 },
  { top: "88%", left: "72%", size: 6,  delay: 0.32, dy: -40 },
  { top: "30%", left: "97%", size: 3,  delay: 0.25, dy: -58 },
];

// ── Milestone info ─────────────────────────────────────────────────────────────
function getMilestone(s: number): {
  emoji: string;
  badge: string;
  title: string;
  sub: string;
  color: string;
  colorDim: string;
  glow: string;
  ring: string;
} {
  if (s >= 30)
    return {
      emoji: "💎",
      badge: "ELITE TIER",
      title: "Elite Consistency",
      sub: "30-day legend. You're unstoppable.",
      color: "#a78bfa",
      colorDim: "rgba(167,139,250,0.55)",
      glow: "rgba(167,139,250,0.22)",
      ring: "rgba(167,139,250,0.35)",
    };
  if (s >= 7)
    return {
      emoji: "🚀",
      badge: "WEEKLY WARRIOR",
      title: "Weekly Warrior",
      sub: `${s} days straight. Keep burning.`,
      color: "#38bdf8",
      colorDim: "rgba(56,189,248,0.55)",
      glow: "rgba(56,189,248,0.18)",
      ring: "rgba(56,189,248,0.35)",
    };
  if (s >= 3)
    return {
      emoji: "⚡",
      badge: "ON FIRE",
      title: "Momentum Unlocked",
      sub: `${s} days in a row — you're on a roll`,
      color: "#fbbf24",
      colorDim: "rgba(251,191,36,0.55)",
      glow: "rgba(251,191,36,0.18)",
      ring: "rgba(251,191,36,0.35)",
    };
  return {
    emoji: "🔥",
    badge: s === 1 ? "DAY 1" : "GOING",
    title: s === 1 ? "Streak Started!" : "Streak Saved",
    sub: s === 1 ? "Day 1 — the journey begins 💪" : `${s} days going strong`,
    color: "#f97316",
    colorDim: "rgba(249,115,22,0.55)",
    glow: "rgba(249,115,22,0.2)",
    ring: "rgba(249,115,22,0.35)",
  };
}

const HOLD_MS = 3000;

// ── Component ──────────────────────────────────────────────────────────────────
export function StreakCelebration({ streak, onDone }: Props) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0); // 0=hidden 1=visible 2=leaving
  const m = getMilestone(streak);

  const dismiss = () => {
    if (phase === 2) return;
    setPhase(2);
    setTimeout(onDone, 430);
  };

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 55);
    const t2 = setTimeout(dismiss, HOLD_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = phase === 1;
  const leaving = phase === 2;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center cursor-pointer select-none overflow-hidden"
      onClick={dismiss}
      style={{
        background: "rgba(3,4,14,0.94)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        transition: "opacity 0.42s ease",
        opacity: leaving ? 0 : visible ? 1 : 0,
      }}
    >
      {/* ── Radial glow ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 58% at 50% 50%, ${m.glow} 0%, transparent 65%)`,
        }}
      />

      {/* ── Floating particles ── */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            background: m.color,
            boxShadow: `0 0 ${p.size * 2.5}px ${m.color}`,
            opacity: visible && !leaving ? 0.6 - i * 0.03 : 0,
            transform:
              visible && !leaving
                ? `translateY(${p.dy}px) scale(1)`
                : "translateY(0) scale(0.1)",
            transition: `opacity 0.55s ${p.delay}s, transform 1.2s ${p.delay}s cubic-bezier(0.34,1.56,0.64,1)`,
          }}
        />
      ))}

      {/* ── Main card ── */}
      <div
        className="relative flex flex-col items-center gap-5 px-8 text-center max-w-[320px]"
        style={{
          transition:
            "transform 0.68s cubic-bezier(0.34,1.56,0.64,1), opacity 0.45s ease",
          transform:
            visible && !leaving
              ? "scale(1) translateY(0)"
              : "scale(0.72) translateY(32px)",
          opacity: visible && !leaving ? 1 : 0,
        }}
      >
        {/* Milestone badge */}
        <div
          className="px-4 py-1 rounded-full text-[10px] font-black tracking-[0.22em] uppercase"
          style={{
            background: `${m.color}18`,
            color: m.color,
            border: `1px solid ${m.ring}`,
          }}
        >
          {m.badge}
        </div>

        {/* Emoji with glow ring */}
        <div className="relative flex items-center justify-center">
          {/* Pulse ring */}
          <div
            className="absolute rounded-full"
            style={{
              width: "clamp(100px,28vw,140px)",
              height: "clamp(100px,28vw,140px)",
              background: `radial-gradient(circle, ${m.glow} 0%, transparent 70%)`,
              animation: visible ? "flamePulse 2s ease-in-out infinite" : "none",
            }}
          />
          <span
            className="streak-emoji-bounce"
            style={{
              fontSize: "clamp(64px,18vw,88px)",
              lineHeight: 1,
              filter: `drop-shadow(0 0 28px ${m.color}) drop-shadow(0 0 60px ${m.glow})`,
            }}
          >
            {m.emoji}
          </span>
        </div>

        {/* Streak number */}
        <div className="flex items-baseline gap-2">
          <span
            className="font-black leading-none"
            style={{
              fontSize: "clamp(4.5rem,18vw,7rem)",
              color: m.color,
              textShadow: `0 0 48px ${m.color}50, 0 0 100px ${m.glow}`,
              letterSpacing: "-3px",
            }}
          >
            {streak}
          </span>
          <span className="text-xl font-bold" style={{ color: "rgba(255,255,255,0.22)" }}>
            day{streak !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Title + sub */}
        <div className="space-y-1.5">
          <p
            className="font-black text-white tracking-tight"
            style={{ fontSize: "clamp(1.35rem,4.5vw,1.9rem)" }}
          >
            {m.title}
          </p>
          <p className="text-sm font-medium" style={{ color: m.colorDim }}>
            {m.sub}
          </p>
        </div>

        {/* "Don't break" nudge */}
        {streak >= 2 && (
          <p
            className="text-[11px] font-semibold"
            style={{ color: "rgba(249,115,22,0.5)" }}
          >
            🔥 Don't break the streak
          </p>
        )}

        {/* Countdown bar */}
        <div
          className="w-28 h-[2px] rounded-full overflow-hidden"
          style={{ background: `${m.color}18` }}
        >
          <div
            className="h-full rounded-full streak-countdown"
            style={{ background: m.color }}
          />
        </div>

        <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.18)" }}>
          tap to continue
        </p>
      </div>
    </div>
  );
}
