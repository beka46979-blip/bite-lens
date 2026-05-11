'use server';

import { cookies } from 'next/headers';
import { Locale, defaultLocale } from './index';

const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

export async function getLocaleFromCookie(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_COOKIE_NAME)?.value as Locale | undefined;
  return locale && (locale === 'kg' || locale === 'ru') ? locale : defaultLocale;
}

export async function setLocaleCookie(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 год
    sameSite: 'lax',
  });
}
