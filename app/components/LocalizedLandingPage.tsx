'use client';

import { useState } from "react";
import {
  Camera,
  Target,
  BarChart3,
  Flame,
  Scale,
  Bell,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  Check,
  Zap,
  Shield,
  Star,
} from "lucide-react";
import { FeatureCard } from "./FeatureCard";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { useTranslation } from "@/app/i18n/useTranslation";
import { Locale } from "@/app/i18n";
import Link from "next/link";

interface LocalizedLandingPageProps {
  locale: Locale;
}

export function LocalizedLandingPage({ locale }: LocalizedLandingPageProps) {
  const { t } = useTranslation(locale, 'landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl z-50 border-b border-gray-100 dark:border-gray-900">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
              {t.header.appName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <a
              href="#features"
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              {t.header.nav.features}
            </a>
            <a
              href="#how-it-works"
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              {t.header.nav.howItWorks}
            </a>
            <a
              href="#pricing"
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              {t.header.nav.pricing}
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher currentLocale={locale} />
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1" />
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {t.header.buttons.login}
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 shadow-sm"
            >
              {t.header.buttons.getStarted}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 dark:text-gray-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
            <div className="px-4 py-4 space-y-1">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg"
              >
                {t.header.nav.features}
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg"
              >
                {t.header.nav.howItWorks}
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg"
              >
                {t.header.nav.pricing}
              </a>
              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-900 space-y-2">
                <div className="flex items-center justify-center gap-3 pb-2">
                  <ThemeToggle />
                  <LanguageSwitcher currentLocale={locale} />
                </div>
                <Link
                  href="/login"
                  className="block px-3 py-2.5 text-center text-base font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 rounded-lg"
                >
                  {t.header.buttons.login}
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2.5 text-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold"
                >
                  {t.header.buttons.getStarted}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-emerald-200/40 via-teal-100/20 to-transparent dark:from-emerald-900/20 dark:via-teal-900/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border border-emerald-200/50 dark:border-emerald-800/50 rounded-full mb-8">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-400">
              {t.hero.badge}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.05] mb-6">
            {t.hero.title.part1}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              {t.hero.title.part2}
            </span>
          </h1>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-10">
            {t.hero.description}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-7 py-3.5 rounded-xl text-base font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 shadow-lg shadow-gray-900/10 dark:shadow-white/10"
            >
              {t.hero.buttons.tryFree}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white px-7 py-3.5 rounded-xl text-base font-semibold hover:bg-gray-50 dark:hover:bg-gray-800">
              {t.hero.buttons.watchDemo}
            </button>
          </div>

          {/* Social proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-white dark:border-gray-950 shadow-sm"
                />
              ))}
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-2 text-sm font-semibold text-gray-900 dark:text-white">5.0</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.hero.social.users}</p>
            </div>
          </div>
        </div>

        {/* App Preview */}
        <div className="max-w-5xl mx-auto mt-16 sm:mt-20 relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 blur-3xl -z-10" />

          {/* Browser frame */}
          <div className="bg-gray-100 dark:bg-gray-900 rounded-t-2xl border border-gray-200 dark:border-gray-800 shadow-2xl shadow-gray-900/10 dark:shadow-black/40 overflow-hidden">
            {/* Browser dots */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <div className="flex-1 mx-4">
                <div className="bg-gray-100 dark:bg-gray-900 rounded-md px-3 py-1 text-xs text-gray-500 dark:text-gray-500 max-w-md mx-auto text-center">
                  bite-lens.app/dashboard
                </div>
              </div>
            </div>

            {/* App content mockup */}
            <div className="bg-white dark:bg-gray-950 p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Calorie ring card */}
                <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t.hero.demo.calories}
                    </h3>
                    <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold rounded">
                      LIVE
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    {/* SVG ring */}
                    <div className="relative flex-shrink-0">
                      <svg width="120" height="120" className="transform -rotate-90">
                        <circle
                          cx="60"
                          cy="60"
                          r="48"
                          fill="none"
                          strokeWidth="10"
                          className="stroke-gray-200 dark:stroke-gray-800"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="48"
                          fill="none"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 48}
                          strokeDashoffset={2 * Math.PI * 48 * (1 - 0.65)}
                          className="stroke-emerald-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">450</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">из 700</p>
                      </div>
                    </div>
                    {/* Macros */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">{t.hero.demo.protein}</span>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">25г</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-blue-500 rounded-full" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">{t.hero.demo.fats}</span>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">15г</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full w-1/2 bg-amber-500 rounded-full" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">{t.hero.demo.carbs}</span>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">45г</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full w-2/3 bg-purple-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Side card */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <Camera className="w-6 h-6 mb-3" />
                    <p className="text-sm font-semibold mb-1">AI анализ</p>
                    <p className="text-xs text-white/80 mb-4">Сканируй и получи КБЖУ за секунды</p>
                    <div className="flex items-center gap-2 text-xs">
                      <Zap className="w-3 h-3" />
                      <span>GPT-4 Vision</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent meal item */}
              <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-200 to-red-300 flex items-center justify-center text-lg flex-shrink-0">
                  🍽️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Бешбармак</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">12:30 · Обед</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">450</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">ккал</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos / Trust bar */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-y border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-950/50">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-6">
            Powered by
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-12 opacity-60 dark:opacity-50">
            <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">OpenAI GPT-4</div>
            <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Next.js 16</div>
            <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">PostgreSQL</div>
            <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">React 19</div>
            <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Tailwind v4</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full mb-4 uppercase tracking-wider">
              Возможности
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
              {t.features.title}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
              {t.features.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Camera}
              title={t.features.items.aiAnalysis.title}
              description={t.features.items.aiAnalysis.description}
            />
            <FeatureCard
              icon={Target}
              title={t.features.items.personalGoals.title}
              description={t.features.items.personalGoals.description}
            />
            <FeatureCard
              icon={BarChart3}
              title={t.features.items.detailedStats.title}
              description={t.features.items.detailedStats.description}
            />
            <FeatureCard
              icon={Flame}
              title={t.features.items.streaks.title}
              description={t.features.items.streaks.description}
            />
            <FeatureCard
              icon={Scale}
              title={t.features.items.weightControl.title}
              description={t.features.items.weightControl.description}
            />
            <FeatureCard
              icon={Bell}
              title={t.features.items.reminders.title}
              description={t.features.items.reminders.description}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full mb-4 uppercase tracking-wider">
              Как это работает
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
              {t.howItWorks.title}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
              {t.howItWorks.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[t.howItWorks.steps.step1, t.howItWorks.steps.step2, t.howItWorks.steps.step3].map(
              (step, index) => (
                <div
                  key={index}
                  className="relative bg-white dark:bg-gray-950 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                      {step.number}
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-emerald-200 dark:from-emerald-800 to-transparent" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-900 dark:bg-gray-900 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden border border-gray-800">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {[t.stats.activeUsers, t.stats.analyzedMeals, t.stats.aiAccuracy, t.stats.rating].map(
                (stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">{stat.label}</div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full mb-4 uppercase tracking-wider">
              Тарифы
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
              {t.pricing.title}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
              {t.pricing.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[t.pricing.plans.free, t.pricing.plans.pro, t.pricing.plans.premium].map(
              (plan, index) => {
                const isPopular = index === 1;
                return (
                  <div
                    key={index}
                    className={`relative rounded-2xl p-8 ${
                      isPopular
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-2xl ring-1 ring-gray-900 dark:ring-white scale-100 lg:scale-105 z-10'
                        : 'bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold rounded-full shadow-lg">
                          <Sparkles className="w-3 h-3" />
                          {t.pricing.popular}
                        </span>
                      </div>
                    )}
                    <div className="mb-8">
                      <h3
                        className={`text-lg font-semibold mb-3 ${
                          isPopular ? '' : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {plan.name}
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-5xl font-bold ${
                            isPopular ? '' : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {plan.price}
                        </span>
                        <span
                          className={`text-sm ${
                            isPopular
                              ? 'text-gray-400 dark:text-gray-600'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {plan.period}
                        </span>
                      </div>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <Check
                            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                              isPopular
                                ? 'text-emerald-400 dark:text-emerald-600'
                                : 'text-emerald-500'
                            }`}
                          />
                          <span
                            className={
                              isPopular
                                ? 'text-gray-200 dark:text-gray-800'
                                : 'text-gray-700 dark:text-gray-300'
                            }
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/register"
                      className={`block text-center py-3 rounded-xl font-semibold ${
                        isPopular
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                          : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-8 sm:p-12 lg:p-16 text-center text-white overflow-hidden shadow-2xl">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:32px_32px]" />

            <div className="relative">
              <Sparkles className="w-10 h-10 mx-auto mb-4 opacity-80" />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                {t.cta.title}
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                {t.cta.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 bg-white text-emerald-600 px-7 py-3.5 rounded-xl text-base font-semibold hover:bg-gray-50 shadow-lg"
                >
                  {t.cta.buttons.download}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white px-7 py-3.5 rounded-xl text-base font-semibold hover:bg-white/20">
                  {t.cta.buttons.learnMore}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t.header.appName}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t.footer.description}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                {t.footer.sections.product.title}
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#features"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    {t.footer.sections.product.links.features}
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    {t.footer.sections.product.links.pricing}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    {t.footer.sections.product.links.reviews}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                {t.footer.sections.company.title}
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    {t.footer.sections.company.links.about}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    {t.footer.sections.company.links.blog}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    {t.footer.sections.company.links.careers}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                {t.footer.sections.support.title}
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    {t.footer.sections.support.links.help}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    {t.footer.sections.support.links.contact}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    {t.footer.sections.support.links.policy}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-500">{t.footer.copyright}</p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                {t.footer.social.twitter}
              </a>
              <a
                href="#"
                className="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                {t.footer.social.instagram}
              </a>
              <a
                href="#"
                className="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                {t.footer.social.facebook}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
