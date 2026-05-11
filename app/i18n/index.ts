import kg_landing from './locales/kg/landing.json';
import kg_layout from './locales/kg/layout.json';
import kg_auth from './locales/kg/auth.json';
import ru_landing from './locales/ru/landing.json';
import ru_layout from './locales/ru/layout.json';
import ru_auth from './locales/ru/auth.json';

export type Locale = 'kg' | 'ru';

export const locales: Locale[] = ['kg', 'ru'];

export const defaultLocale: Locale = 'ru';

export const translations = {
  kg: {
    landing: kg_landing,
    layout: kg_layout,
    auth: kg_auth,
  },
  ru: {
    landing: ru_landing,
    layout: ru_layout,
    auth: ru_auth,
  },
};

export function getTranslations(locale: Locale, page: keyof typeof translations['ru']) {
  return translations[locale]?.[page] || translations[defaultLocale][page];
}

export const localeNames: Record<Locale, string> = {
  kg: 'Кыргызча',
  ru: 'Русский',
};
