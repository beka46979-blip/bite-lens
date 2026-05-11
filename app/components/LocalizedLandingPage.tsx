'use client';

import { useState } from "react";
import { Camera, Target, BarChart3, Flame, Scale, Bell, Menu, X } from "lucide-react";
import { FeatureCard } from "./FeatureCard";
import { LanguageSwitcher } from "./LanguageSwitcher";
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-black">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">{t.header.appName}</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition">
              {t.header.nav.features}
            </a>
            <a href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition">
              {t.header.nav.howItWorks}
            </a>
            <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition">
              {t.header.nav.pricing}
            </a>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher currentLocale={locale} />
            <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition">
              {t.header.buttons.login}
            </Link>
            <Link href="/register" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all">
              {t.header.buttons.getStarted}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="px-4 py-4 space-y-4">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition py-2"
              >
                {t.header.nav.features}
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition py-2"
              >
                {t.header.nav.howItWorks}
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition py-2"
              >
                {t.header.nav.pricing}
              </a>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                <LanguageSwitcher currentLocale={locale} />
                <Link
                  href="/login"
                  className="block text-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition py-2"
                >
                  {t.header.buttons.login}
                </Link>
                <Link
                  href="/register"
                  className="block text-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all"
                >
                  {t.header.buttons.getStarted}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="inline-block">
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-medium">
                  {t.hero.badge}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                {t.hero.title.part1}
                <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                  {t.hero.title.part2}
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                {t.hero.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105">
                  {t.hero.buttons.tryFree}
                </button>
                <button className="border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                  {t.hero.buttons.watchDemo}
                </button>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-8 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-white dark:border-gray-900" />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="text-yellow-400 text-sm sm:text-base">★</span>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.hero.social.users}</p>
                </div>
              </div>
            </div>
            <div className="relative mt-8 lg:mt-0">
              <div className="relative z-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <span className="text-4xl sm:text-5xl lg:text-6xl">🍽️</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t.hero.demo.calories}</span>
                      <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">450</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 sm:p-3 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">{t.hero.demo.protein}</p>
                        <p className="text-sm sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">25г</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">{t.hero.demo.fats}</p>
                        <p className="text-sm sm:text-lg font-bold text-blue-600 dark:text-blue-400">15г</p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-2 sm:p-3 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">{t.hero.demo.carbs}</p>
                        <p className="text-sm sm:text-lg font-bold text-orange-600 dark:text-orange-400">45г</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden sm:block absolute -bottom-4 -right-4 w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 bg-gradient-to-br from-emerald-200 to-teal-200 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl sm:rounded-3xl -z-0" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t.features.title}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t.features.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t.howItWorks.title}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t.howItWorks.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[t.howItWorks.steps.step1, t.howItWorks.steps.step2, t.howItWorks.steps.step3].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-8 text-center">
                  <div className="text-6xl font-bold opacity-20 mb-4">{step.number}</div>
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-emerald-50">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <span className="text-4xl text-emerald-500">→</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center text-white">
            {[
              t.stats.activeUsers,
              t.stats.analyzedMeals,
              t.stats.aiAccuracy,
              t.stats.rating
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm lg:text-base text-emerald-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t.pricing.title}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t.pricing.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[t.pricing.plans.free, t.pricing.plans.pro, t.pricing.plans.premium].map((plan, index) => {
              const isPopular = index === 1;
              return (
                <div
                  key={index}
                  className={`relative rounded-2xl p-8 ${
                    isPopular
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl transform scale-105"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                        {t.pricing.popular}
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold">{plan.price}</span>
                      <span className={isPopular ? "text-emerald-100" : "text-gray-500 dark:text-gray-400"}>
                        {plan.period}
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className={isPopular ? "text-emerald-200" : "text-emerald-500"}>✓</span>
                        <span className={isPopular ? "text-emerald-50" : ""}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-4 rounded-full font-semibold transition-all ${
                      isPopular
                        ? "bg-white text-emerald-600 hover:bg-emerald-50"
                        : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-white">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              {t.cta.title}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-emerald-50 mb-6 sm:mb-8">
              {t.cta.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button className="bg-white text-emerald-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-emerald-50 transition-all">
                {t.cta.buttons.download}
              </button>
              <button className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-white/10 transition-all">
                {t.cta.buttons.learnMore}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <span className="text-xl font-bold text-white">{t.header.appName}</span>
              </div>
              <p className="text-gray-400">
                {t.footer.description}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">{t.footer.sections.product.title}</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">{t.footer.sections.product.links.features}</a></li>
                <li><a href="#" className="hover:text-white transition">{t.footer.sections.product.links.pricing}</a></li>
                <li><a href="#" className="hover:text-white transition">{t.footer.sections.product.links.reviews}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">{t.footer.sections.company.title}</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">{t.footer.sections.company.links.about}</a></li>
                <li><a href="#" className="hover:text-white transition">{t.footer.sections.company.links.blog}</a></li>
                <li><a href="#" className="hover:text-white transition">{t.footer.sections.company.links.careers}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">{t.footer.sections.support.title}</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">{t.footer.sections.support.links.help}</a></li>
                <li><a href="#" className="hover:text-white transition">{t.footer.sections.support.links.contact}</a></li>
                <li><a href="#" className="hover:text-white transition">{t.footer.sections.support.links.policy}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">{t.footer.copyright}</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition">{t.footer.social.twitter}</a>
              <a href="#" className="hover:text-white transition">{t.footer.social.instagram}</a>
              <a href="#" className="hover:text-white transition">{t.footer.social.facebook}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
