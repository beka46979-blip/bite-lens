'use client';

import { Locale, translations } from './index';
import type { LandingTranslations, LayoutTranslations, AuthTranslations } from './types';

export function useTranslation(locale: Locale, page: 'landing'): { t: LandingTranslations; locale: Locale } {
  const t = translations[locale].landing;
  return { t, locale };
}

export function useLayoutTranslation(locale: Locale): { t: LayoutTranslations; locale: Locale } {
  const t = translations[locale].layout;
  return { t, locale };
}

export function useAuthTranslation(locale: Locale): { t: AuthTranslations; locale: Locale } {
  const t = translations[locale].auth;
  return { t, locale };
}
