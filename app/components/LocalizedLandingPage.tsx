'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Menu, X,
  Camera, Target, BarChart3, Trophy, Scale, Bell,
  Zap, Crown, Check, Minus, Lock, Smartphone,
  Flame, Dumbbell, Wheat, Droplets,
  UtensilsCrossed, Apple, Salad, Coffee,
  type LucideIcon,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "@/app/i18n/useTranslation";
import { Locale } from "@/app/i18n";

// ── tiny hook for fade-up animation on scroll ─────────────────────────────
function useFadeUp() {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < window.innerHeight) { setVis(true); return; }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, className: `lp-fade-up${vis ? " lp-vis" : ""}` };
}

// ── shared style helpers ──────────────────────────────────────────────────
const SYNE: React.CSSProperties = { fontFamily: "var(--font-syne), sans-serif" };
const V = (v: string) => `var(${v})`;
const WRAP: React.CSSProperties = { maxWidth: 1280, margin: "0 auto" };

// ── feature icon components ───────────────────────────────────────────────
const FEAT_ICONS: LucideIcon[] = [Camera, Target, BarChart3, Trophy, Scale, Bell];

// ── log items for hero mockup ─────────────────────────────────────────────
const LOG_ITEMS: { Icon: LucideIcon; name: string; time: string; kcal: string }[] = [
  { Icon: Coffee,       name: "Овсянка", time: "08:30", kcal: "320 ккал" },
  { Icon: Apple,        name: "Яблоко",  time: "11:00", kcal: "89 ккал"  },
  { Icon: Salad,        name: "Салат",   time: "13:15", kcal: "180 ккал" },
];

// ── how-it-works result rows ──────────────────────────────────────────────
const HOW_ROWS: { Icon: LucideIcon; lbl: string; val: string }[] = [
  { Icon: Flame,    lbl: "Калории",  val: "340 ккал" },
  { Icon: Dumbbell, lbl: "Белки",    val: "18 г"     },
  { Icon: Wheat,    lbl: "Углеводы", val: "32 г"     },
  { Icon: Droplets, lbl: "Жиры",     val: "14 г"     },
];

// ── pricing data ──────────────────────────────────────────────────────────
const PLANS = [
  {
    key:      "free",
    PillIcon: Scale,
    pillLabel: "Free",
    price:    "0",
    currency: "сом",
    period:   "навсегда бесплатно",
    feats: [
      { ok: true,  label: "Трекер калорий"      },
      { ok: true,  label: "3 приёма в день"      },
      { ok: true,  label: "Базовые макро"        },
      { ok: false, label: "Без AI-сканирования"  },
      { ok: false, label: "Без аналитики"        },
    ],
    btnLabel: "Начать бесплатно",
    href:     "/register",
  },
  {
    key:      "pro",
    PillIcon: Zap,
    pillLabel: "Популярный",
    price:    "490",
    currency: "сом/мес",
    period:   "отмена в любое время",
    feats: [
      { ok: true, label: "Всё из Free"           },
      { ok: true, label: "AI-сканирование"       },
      { ok: true, label: "Неограниченные снапы"  },
      { ok: true, label: "Детальная аналитика"   },
      { ok: true, label: "Персональный план"     },
    ],
    btnLabel: "Перейти на Pro",
    highlight: true,
    href:     "/subscription?plan=pro",
  },
  {
    key:      "premium",
    PillIcon: Crown,
    pillLabel: "Лучший",
    price:    "890",
    currency: "сом/мес",
    period:   "полный доступ",
    feats: [
      { ok: true, label: "Всё из Pro"                },
      { ok: true, label: "AI-тренер 24/7"            },
      { ok: true, label: "Рецепты под план"          },
      { ok: true, label: "Приоритетная поддержка"    },
      { ok: true, label: "Ранний доступ"             },
    ],
    btnLabel: "Получить Premium",
    href:     "/subscription?plan=premium",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
export function LocalizedLandingPage({ locale }: { locale: Locale }) {
  const { t } = useTranslation(locale, "landing");
  const [mobileOpen, setMobileOpen] = useState(false);

  const mockFU  = useFadeUp();
  const featFU  = useFadeUp();
  const visFU   = useFadeUp();
  const priceFU = useFadeUp();
  const ctaFU   = useFadeUp();

  const bg    = V("--lp-bg");
  const bg2   = V("--lp-bg2");
  const bg3   = V("--lp-bg3");
  const card  = V("--lp-card");
  const bdr   = V("--lp-border");
  const grn   = V("--lp-green");
  const gSoft = V("--lp-green-soft");
  const gMid  = V("--lp-green-mid");
  const gGlow = V("--lp-green-glow");
  const gBtn  = V("--lp-green-btn");
  const gTxt  = V("--lp-green-txt");
  const pur   = V("--lp-purple");
  const pSoft = V("--lp-purple-soft");
  const txt   = V("--lp-text");
  const mut   = V("--lp-muted");
  const mut2  = V("--lp-muted2");
  const shad  = V("--lp-shadow");
  const shadM = V("--lp-shadow-md");
  const rad   = V("--lp-radius");
  const radS  = V("--lp-radius-sm");
  const proBg   = V("--lp-pro-bg");   const proBdr   = V("--lp-pro-bdr");   const proShad  = V("--lp-pro-shadow");
  const premBg  = V("--lp-prem-bg");  const premBdr  = V("--lp-prem-bdr");  const premShad = V("--lp-prem-shadow");
  const ctaBg   = V("--lp-cta-bg");   const ctaBdr   = V("--lp-cta-bdr");
  const ctaTitle= V("--lp-cta-title");const ctaSub   = V("--lp-cta-sub");
  const ctaTrust= V("--lp-cta-trust");const ctaObdr  = V("--lp-cta-outline-bdr");
  const ctaB1bg = V("--lp-cta-btn1-bg"); const ctaB1cl = V("--lp-cta-btn1-clr");
  const ctaB2cl = V("--lp-cta-btn2-clr");

  return (
    <div style={{ background: bg, color: txt, fontFamily: "var(--font-geist-sans), sans-serif", overflowX: "hidden" }}>

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: `color-mix(in srgb, ${bg} 88%, transparent)`,
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${bdr}`,
      }}>
        <div style={{ ...WRAP, padding: "14px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 34, height: 34, borderRadius: 12,
            background: gSoft, border: `1.5px solid rgba(29,184,122,0.25)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Camera size={17} style={{ color: grn }} />
          </div>
          <span style={{ ...SYNE, fontWeight: 800, fontSize: 20, color: txt }}>
            {t.header.appName}
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex" style={{ listStyle: "none", display: "flex", gap: 32, margin: 0, padding: 0 }}>
          {[
            { href: "#features", label: t.header.nav.features    },
            { href: "#how",      label: t.header.nav.howItWorks  },
            { href: "#pricing",  label: t.header.nav.pricing      },
          ].map(({ href, label }) => (
            <li key={href}>
              <a href={href} style={{ color: mut, fontSize: 14, textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = txt)}
                onMouseLeave={e => (e.currentTarget.style.color = mut)}>
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="hidden md:flex" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            fontSize: 11, background: gSoft, color: grn, padding: "4px 11px",
            borderRadius: 50, border: `1px solid rgba(29,184,122,0.2)`, fontWeight: 500,
          }}>AI powered</span>
          <ThemeToggle />
          <LanguageSwitcher currentLocale={locale} />
          <Link href="/login" style={{ fontSize: 14, color: mut, textDecoration: "none", padding: "8px 12px" }}>
            {t.header.buttons.login}
          </Link>
          <Link href="/register" style={{
            background: grn, color: gTxt, padding: "10px 22px", borderRadius: 50,
            fontSize: 14, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap",
            transition: "all .2s",
          }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = gBtn; el.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = grn; el.style.transform = ""; }}>
            Начать бесплатно
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: "none", border: "none", cursor: "pointer", color: txt, padding: 4 }}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: "fixed", top: 57, left: 0, right: 0, zIndex: 99,
          background: bg2, borderBottom: `1px solid ${bdr}`,
          padding: "16px 24px 20px",
        }}>
          {[
            { href: "#features", label: t.header.nav.features   },
            { href: "#how",      label: t.header.nav.howItWorks },
            { href: "#pricing",  label: t.header.nav.pricing     },
          ].map(({ href, label }) => (
            <a key={href} href={href} onClick={() => setMobileOpen(false)} style={{
              display: "block", padding: "12px 0",
              borderBottom: `1px solid ${bdr}`, color: mut, fontSize: 15, textDecoration: "none",
            }}>{label}</a>
          ))}
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16 }}>
            <ThemeToggle />
            <LanguageSwitcher currentLocale={locale} />
          </div>
          <Link href="/register" onClick={() => setMobileOpen(false)} style={{
            display: "block", marginTop: 12, textAlign: "center",
            background: grn, color: gTxt, padding: "12px 0", borderRadius: 50,
            fontWeight: 600, fontSize: 15, textDecoration: "none",
          }}>Начать бесплатно</Link>
        </div>
      )}

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "140px 24px 80px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Glow blobs */}
        <div style={{
          position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
          width: 700, height: 500, pointerEvents: "none",
          background: `radial-gradient(ellipse, ${gMid} 0%, transparent 65%)`,
        }} />
        <div style={{
          position: "absolute", bottom: "15%", right: "5%",
          width: 350, height: 350, pointerEvents: "none",
          background: `radial-gradient(ellipse, ${pSoft} 0%, transparent 70%)`,
        }} />

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: gSoft, color: grn,
          fontSize: 12, fontWeight: 600, padding: "7px 16px",
          borderRadius: 50, marginBottom: 28,
          border: `1px solid rgba(29,184,122,0.2)`,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: grn,
            animation: "lp-pulse 1.5s infinite", display: "inline-block",
          }} />
          GPT-4 Vision · Мгновенный анализ
        </div>

        {/* H1 */}
        <h1 style={{
          ...SYNE,
          fontSize: "clamp(38px,7vw,84px)",
          fontWeight: 800, lineHeight: 1.0, letterSpacing: -2,
          color: txt, maxWidth: 820, marginBottom: 22,
        }}>
          {t.hero.title.part1}<br />
          <em style={{ fontStyle: "normal", color: grn }}>{t.hero.title.part2}</em>
        </h1>

        {/* Sub */}
        <p style={{ fontSize: 17, color: mut, maxWidth: 460, lineHeight: 1.7, marginBottom: 42, fontWeight: 300 }}>
          {t.hero.description}
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 64 }}>
          <Link href="/register" style={{
            background: grn, color: gTxt, padding: "15px 28px",
            borderRadius: 50, fontSize: 15, fontWeight: 600,
            textDecoration: "none", display: "flex", alignItems: "center", gap: 8,
            transition: "all .2s",
          }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = gBtn; el.style.transform = "translateY(-2px)"; el.style.boxShadow = `0 6px 24px ${gGlow}`; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = grn; el.style.transform = ""; el.style.boxShadow = ""; }}>
            <Camera size={16} />
            {t.hero.buttons.tryFree}
          </Link>
          <a href="#how" style={{
            background: bg2, color: txt, padding: "15px 28px",
            borderRadius: 50, fontSize: 15, fontWeight: 500,
            textDecoration: "none", border: `1px solid ${bdr}`,
            boxShadow: shad, transition: "all .2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}>
            Смотреть демо →
          </a>
        </div>

        {/* ── Hero Mockup ────────────────────────────────────────────── */}
        <div ref={mockFU.ref} className={mockFU.className} style={{
          width: "100%", maxWidth: 760,
          background: bg2, borderRadius: 26,
          border: `1px solid ${bdr}`, overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.12)",
        }}>
          {/* Window chrome */}
          <div style={{
            background: bg3, padding: "13px 20px",
            display: "flex", alignItems: "center", gap: 8,
            borderBottom: `1px solid ${bdr}`,
          }}>
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF5F57" }} />
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#FEBC2E" }} />
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#28C840" }} />
            <span style={{ fontSize: 13, color: mut, margin: "0 auto" }}>Bite Lens Dashboard</span>
          </div>
          {/* Body */}
          <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Left col */}
            <div>
              {/* Photo card */}
              <div style={{
                background: bg3, border: `1px solid ${bdr}`,
                borderRadius: radS, padding: 18, marginBottom: 12, textAlign: "center",
              }}>
                <div style={{
                  width: "100%", height: 130, borderRadius: 10,
                  background: `linear-gradient(135deg,var(--lp-green-soft),rgba(29,184,122,0.08))`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 12, position: "relative", overflow: "hidden",
                }}>
                  <UtensilsCrossed size={52} style={{ color: grn, opacity: 0.6 }} />
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 2,
                    background: `linear-gradient(90deg,transparent,${grn},transparent)`,
                    animation: "lp-scan 2.5s ease-in-out infinite",
                  }} />
                </div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: gSoft, color: grn,
                  fontSize: 12, fontWeight: 500, padding: "5px 12px",
                  borderRadius: 50, border: `1px solid rgba(29,184,122,0.2)`,
                }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: "50%", background: grn,
                    animation: "lp-pulse 1.5s infinite", display: "inline-block",
                  }} />
                  AI анализирует блюдо...
                </div>
              </div>
              {/* Macros card */}
              <div style={{ background: bg3, border: `1px solid ${bdr}`, borderRadius: radS, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: gSoft, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <UtensilsCrossed size={16} style={{ color: grn }} />
                  </div>
                  <div>
                    <div style={{ ...SYNE, fontSize: 14, fontWeight: 700, color: txt }}>Паста Карбонара</div>
                    <div style={{ fontSize: 11, color: mut }}>~320 г · 1 порция</div>
                  </div>
                </div>
                {[
                  { lbl: "Белки",    pct: "70%", clr: grn,       val: "22г" },
                  { lbl: "Углеводы", pct: "52%", clr: "#f59e0b",  val: "58г" },
                  { lbl: "Жиры",     pct: "36%", clr: "#f97316",  val: "18г" },
                ].map(({ lbl, pct, clr, val }) => (
                  <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, fontSize: 11 }}>
                    <span style={{ color: mut, width: 54 }}>{lbl}</span>
                    <div style={{ flex: 1, height: 5, background: mut2, borderRadius: 3, overflow: "hidden", opacity: 0.35 }}>
                      <div style={{ height: "100%", borderRadius: 3, background: clr, width: pct }} />
                    </div>
                    <span style={{ width: 26, textAlign: "right", fontWeight: 600, color: txt }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Right col */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: gSoft, border: `1px solid rgba(29,184,122,0.2)`, borderRadius: radS, padding: 14 }}>
                <div style={{ ...SYNE, fontSize: 28, fontWeight: 800, color: grn, lineHeight: 1 }}>450</div>
                <div style={{ fontSize: 11, color: grn, opacity: 0.7, marginTop: 3 }}>ккал в этом блюде</div>
              </div>
              <div style={{ background: bg2, border: `1px solid ${bdr}`, borderRadius: radS, padding: 14, boxShadow: shad }}>
                <div style={{ ...SYNE, fontSize: 28, fontWeight: 800, color: txt, lineHeight: 1 }}>1 350</div>
                <div style={{ fontSize: 11, color: mut, marginTop: 3 }}>осталось сегодня</div>
              </div>
              <div style={{ background: bg2, border: `1px solid ${bdr}`, borderRadius: radS, padding: 14, boxShadow: shad }}>
                <div style={{ fontSize: 11, color: mut, marginBottom: 8 }}>Дневная цель</div>
                <div style={{ height: 7, background: bg3, borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ height: "100%", width: "68%", borderRadius: 4, background: grn }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: grn, fontWeight: 600 }}>1 250 ккал</span>
                  <span style={{ color: mut }}>/ 1 800</span>
                </div>
              </div>
              <div style={{ background: bg2, border: `1px solid ${bdr}`, borderRadius: radS, padding: 12, boxShadow: shad, flex: 1 }}>
                <div style={{ fontSize: 11, color: mut, marginBottom: 8, fontWeight: 500 }}>Сегодня</div>
                {LOG_ITEMS.map(({ Icon, name, time, kcal }) => (
                  <div key={name} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "5px 0", borderBottom: `1px solid ${bg3}`,
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 6, background: gSoft,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Icon size={12} style={{ color: grn }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: txt }}>{name}</div>
                      <div style={{ fontSize: 10, color: mut }}>{time}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: grn }}>{kcal}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <div style={{
        background: bg2,
        borderTop: `1px solid ${bdr}`, borderBottom: `1px solid ${bdr}`,
      }}>
        <div style={{ ...WRAP, display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
        {[
          { val: t.stats.activeUsers.value,   lbl: t.stats.activeUsers.label   },
          { val: t.stats.analyzedMeals.value, lbl: t.stats.analyzedMeals.label },
          { val: t.stats.aiAccuracy.value,    lbl: t.stats.aiAccuracy.label    },
          { val: `${t.stats.rating.value}★`,  lbl: t.stats.rating.label        },
        ].map(({ val, lbl }, i) => (
          <div key={i} style={{
            padding: "36px 24px", textAlign: "center",
            borderRight: i < 3 ? `1px solid ${bdr}` : "none",
          }}>
            <div style={{ ...SYNE, fontSize: 38, fontWeight: 800, color: grn, lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 13, color: mut, marginTop: 6 }}>{lbl}</div>
          </div>
        ))}
        </div>
      </div>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: "100px 0" }}>
        <div style={{ ...WRAP, padding: "0 48px" }}>
        <SecTag label="Возможности" grn={grn} />
        <h2 style={{ ...SYNE, fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: -1, lineHeight: 1.1, maxWidth: 520, marginBottom: 10, color: txt }}>
          {t.features.title}
        </h2>
        <p style={{ fontSize: 16, color: mut, maxWidth: 420, lineHeight: 1.7, fontWeight: 300 }}>
          {t.features.subtitle}
        </p>
        <div ref={featFU.ref} className={featFU.className} style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 52,
        }}>
          {Object.values(t.features.items).map((item, i) => (
            <FeatCard key={i} Icon={FEAT_ICONS[i]} title={item.title} text={item.description}
              bg={card} border={bdr} gSoft={gSoft} grn={grn} txt={txt} mut={mut} rad={rad} shadow={shad} shadowMd={shadM} />
          ))}
        </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how" style={{
        padding: "100px 0",
        background: bg2,
        borderTop: `1px solid ${bdr}`, borderBottom: `1px solid ${bdr}`,
      }}>
        <div style={{ ...WRAP, padding: "0 48px" }}>
        <SecTag label="Как это работает" grn={grn} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}>
          {/* Steps */}
          <div>
            <h2 style={{ ...SYNE, fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: -1, lineHeight: 1.1, maxWidth: 520, marginBottom: 32, color: txt }}>
              {t.howItWorks.subtitle}
            </h2>
            {Object.values(t.howItWorks.steps).map((step, i) => (
              <div key={i} style={{
                display: "flex", gap: 18, padding: "22px 0",
                borderBottom: `1px solid ${bdr}`,
                borderTop: i === 0 ? `1px solid ${bdr}` : "none",
              }}>
                <span style={{ ...SYNE, fontSize: 12, fontWeight: 700, color: grn, width: 22, flexShrink: 0, paddingTop: 2 }}>
                  {step.number}
                </span>
                <div>
                  <div style={{ ...SYNE, fontSize: 15, fontWeight: 700, color: txt, marginBottom: 5 }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: mut, lineHeight: 1.65, fontWeight: 300 }}>{step.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Visual */}
          <div ref={visFU.ref} className={visFU.className} style={{
            background: bg3, borderRadius: 22,
            border: `1px solid ${bdr}`, padding: 28, boxShadow: shadM,
          }}>
            {/* Phone mockup */}
            <div style={{
              width: "100%", height: 170, borderRadius: 14,
              background: `linear-gradient(135deg,var(--lp-green-soft),rgba(29,184,122,0.08))`,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 18, position: "relative", overflow: "hidden",
              border: `1px solid rgba(29,184,122,0.15)`,
            }}>
              <Salad size={64} style={{ color: grn, opacity: 0.55 }} />
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg,transparent,${grn},transparent)`,
                animation: "lp-scan 2.2s ease-in-out infinite",
              }} />
            </div>
            {/* Result rows */}
            {HOW_ROWS.map(({ Icon, lbl, val }) => (
              <div key={lbl} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: bg2, border: `1px solid ${bdr}`,
                borderRadius: 10, padding: "10px 14px",
                marginBottom: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}>
                <span style={{ fontSize: 13, color: mut, display: "flex", alignItems: "center", gap: 7 }}>
                  <Icon size={14} style={{ color: grn }} /> {lbl}
                </span>
                <span style={{ ...SYNE, fontSize: 14, fontWeight: 700, color: grn }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: "100px 0" }}>
        <div style={{ ...WRAP, padding: "0 48px" }}>
        <SecTag label="Тарифы" grn={grn} />
        <h2 style={{ ...SYNE, fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: -1, lineHeight: 1.1, maxWidth: 520, marginBottom: 10, color: txt }}>
          Выбери свой <span style={{ color: grn }}>план</span>
        </h2>
        <p style={{ fontSize: 16, color: mut, maxWidth: 420, lineHeight: 1.7, fontWeight: 300 }}>
          {t.pricing.subtitle}
        </p>
        <div ref={priceFU.ref} className={priceFU.className} style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 52, alignItems: "start",
        }}>
          {PLANS.map((plan) => {
            const isGreen  = plan.key === "pro";
            const isPurple = plan.key === "premium";
            const cardBg     = isGreen ? proBg   : isPurple ? premBg   : card;
            const cardBdr    = isGreen ? proBdr  : isPurple ? premBdr  : bdr;
            const cardShadow = isGreen ? proShad : isPurple ? premShad : shad;
            const pillBg  = isGreen ? gSoft : isPurple ? pSoft : bg3;
            const pillClr = isGreen ? grn   : isPurple ? pur   : mut;
            const pillBdr = isGreen ? "rgba(29,184,122,0.25)" : isPurple ? "rgba(124,92,252,0.2)" : bdr;
            const checkBg  = isGreen ? gSoft : isPurple ? pSoft : bg3;
            const checkClr = isGreen ? grn   : isPurple ? pur   : mut2;
            const btnBg  = isGreen ? grn  : isPurple ? pur  : "transparent";
            const btnClr = isGreen ? gTxt : isPurple ? "#fff" : txt;
            const btnBdr = isGreen ? grn  : isPurple ? pur  : bdr;
            const { PillIcon } = plan;

            return (
              <div key={plan.key} style={{
                background: cardBg, border: `1.5px solid ${cardBdr}`,
                borderRadius: rad, padding: 26,
                boxShadow: cardShadow, transition: "all .25s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}>
                {/* Pill */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px",
                  padding: "4px 12px", borderRadius: 50, marginBottom: 14,
                  background: pillBg, color: pillClr, border: `1px solid ${pillBdr}`,
                }}>
                  <PillIcon size={10} /> {plan.pillLabel}
                </div>
                {/* Plan name */}
                <div style={{ ...SYNE, fontSize: 20, fontWeight: 800, color: txt, marginBottom: 6 }}>
                  {plan.key === "free" ? "Free" : plan.key === "pro" ? "Pro" : "Premium"}
                </div>
                {/* Price */}
                <div style={{ ...SYNE, fontSize: 40, fontWeight: 800, lineHeight: 1, color: txt, marginBottom: 4 }}>
                  {plan.price}{" "}
                  <span style={{ fontSize: 16, color: mut, fontWeight: 400 }}>{plan.currency}</span>
                </div>
                <div style={{ fontSize: 12, color: mut, marginBottom: 22 }}>{plan.period}</div>
                {/* Features */}
                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 24 }}>
                  {plan.feats.map(({ ok, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: ok ? txt : mut }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                        background: ok ? checkBg : bg3, color: ok ? checkClr : mut2,
                      }}>
                        {ok ? <Check size={10} strokeWidth={3} /> : <Minus size={10} />}
                      </div>
                      {label}
                    </div>
                  ))}
                </div>
                {/* CTA */}
                <Link href={plan.href} style={{
                  display: "block", textAlign: "center",
                  padding: "13px 0", borderRadius: 50,
                  fontSize: 14, fontWeight: 600, textDecoration: "none",
                  transition: "all .2s",
                  background: btnBg, color: btnClr,
                  border: `1.5px solid ${btnBdr}`,
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    if (isGreen)  { el.style.background = gBtn; el.style.boxShadow = `0 4px 18px ${gGlow}`; }
                    if (isPurple) { el.style.background = "#6b4ef5"; el.style.boxShadow = "0 4px 18px rgba(124,92,252,0.3)"; }
                    if (!isGreen && !isPurple) el.style.background = bg3;
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = btnBg; el.style.boxShadow = "";
                  }}>
                  {plan.btnLabel}
                </Link>
              </div>
            );
          })}
        </div>
        <p style={{ textAlign: "center", fontSize: 13, color: mut, marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Lock size={13} style={{ color: grn }} /> Безопасная оплата · Отмена в любое время
        </p>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <div style={{ padding: "0 0 80px" }}>
        <div style={{ ...WRAP, padding: "0 48px" }}>
        <div ref={ctaFU.ref} className={ctaFU.className} style={{
          background: ctaBg, border: `1px solid ${ctaBdr}`,
          borderRadius: 28, padding: "80px 48px",
          textAlign: "center", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)",
            width: 600, height: 400, pointerEvents: "none",
            background: `radial-gradient(ellipse,${gMid},transparent 70%)`,
          }} />
          <h2 style={{ ...SYNE, fontSize: "clamp(28px,5vw,50px)", fontWeight: 800, letterSpacing: -1.5, color: ctaTitle, marginBottom: 14 }}>
            {t.cta.title}
          </h2>
          <p style={{ fontSize: 16, color: ctaSub, marginBottom: 36, fontWeight: 300 }}>
            {t.cta.subtitle}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{
              background: ctaB1bg, color: ctaB1cl, padding: "14px 28px", borderRadius: 50,
              fontSize: 15, fontWeight: 600, textDecoration: "none", transition: "all .2s",
              display: "flex", alignItems: "center", gap: 8,
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}>
              <Smartphone size={16} /> {t.cta.buttons.download}
            </Link>
            <a href="#features" style={{
              background: "transparent", color: ctaB2cl,
              padding: "14px 28px", borderRadius: 50,
              fontSize: 15, fontWeight: 500, textDecoration: "none",
              border: `1px solid ${ctaObdr}`, transition: "all .2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}>
              {t.cta.buttons.learnMore}
            </a>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 24, flexWrap: "wrap" }}>
            {["Бесплатно навсегда", "Без рекламы", "Отмена в любое время"].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: ctaTrust }}>
                <Check size={13} style={{ color: grn }} /> {item}
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ background: bg2, borderTop: `1px solid ${bdr}` }}>
        <div style={{ ...WRAP, padding: "36px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, ...SYNE, fontWeight: 800, fontSize: 16, color: txt }}>
          <div style={{
            width: 26, height: 26, borderRadius: 8, background: gSoft,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid rgba(29,184,122,0.2)`,
          }}>
            <Camera size={13} style={{ color: grn }} />
          </div>
          Bite Lens
        </div>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
          {["Возможности", "Тарифы", "О нас", "Блог", "Контакты", "Политика"].map((lnk) => (
            <a key={lnk} href="#" style={{ fontSize: 13, color: mut, textDecoration: "none", transition: "color .2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = txt)}
              onMouseLeave={e => (e.currentTarget.style.color = mut)}>
              {lnk}
            </a>
          ))}
        </div>
        <div style={{ fontSize: 12, color: mut2 }}>{t.footer.copyright}</div>
        </div>
      </footer>
    </div>
  );
}

// ── Section tag ───────────────────────────────────────────────────────────────
function SecTag({ label, grn }: { label: string; grn: string }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 600, letterSpacing: "1.5px", color: grn,
      textTransform: "uppercase", marginBottom: 14,
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ width: 18, height: 2, background: grn, borderRadius: 1, display: "inline-block" }} />
      {label}
    </div>
  );
}

// ── Feature card ─────────────────────────────────────────────────────────────
function FeatCard({
  Icon, title, text, bg, border, gSoft, grn, txt, mut, rad, shadow, shadowMd,
}: {
  Icon: LucideIcon; title: string; text: string;
  bg: string; border: string; gSoft: string; grn: string; txt: string; mut: string;
  rad: string; shadow: string; shadowMd: string;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{
      background: bg, border: `1px solid ${hov ? "rgba(29,184,122,0.2)" : border}`,
      borderRadius: rad, padding: 26,
      boxShadow: hov ? shadowMd : shadow,
      transition: "all .25s",
      transform: hov ? "translateY(-4px)" : "",
      cursor: "default",
    }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>
      <div style={{
        width: 48, height: 48, borderRadius: 14, background: gSoft,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 16,
        border: `1px solid rgba(29,184,122,0.2)`,
      }}>
        <Icon size={20} style={{ color: grn }} />
      </div>
      <div style={{ fontFamily: "var(--font-syne),sans-serif", fontSize: 16, fontWeight: 700, color: txt, marginBottom: 7 }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: mut, lineHeight: 1.7, fontWeight: 300 }}>{text}</div>
    </div>
  );
}
