# Руководство по использованию локализации

## Быстрый старт

Локализация уже настроена и работает на главной странице. Переключатель языков находится в шапке сайта.

## Как это работает

### 1. Структура файлов

```
app/i18n/
├── index.ts                    # Главный файл экспорта
├── types.ts                    # TypeScript типы
├── useTranslation.ts           # React хук для использования переводов
├── locales/
│   ├── kg/                     # Кыргызский
│   │   ├── landing.json
│   │   └── layout.json
│   └── ru/                     # Русский (по умолчанию)
│       ├── landing.json
│       └── layout.json
```

### 2. Использование в компонентах

#### Client Component (с хуком)

```tsx
'use client';

import { useTranslation } from '@/app/i18n/useTranslation';

export function MyComponent() {
  const { t, locale, changeLocale } = useTranslation('landing');
  
  return (
    <div>
      <h1>{t.header.title}</h1>
      <button onClick={() => changeLocale('kg')}>
        Переключить на кыргызский
      </button>
    </div>
  );
}
```

#### Server Component

```tsx
import { getTranslations } from '@/app/i18n';

export function MyServerComponent({ locale }: { locale: 'kg' | 'ru' }) {
  const t = getTranslations(locale, 'landing');
  
  return <h1>{t.header.title}</h1>;
}
```

### 3. Компонент переключателя языков

Компонент `LanguageSwitcher` уже создан и используется в шапке:

```tsx
import { LanguageSwitcher } from '@/app/components/LanguageSwitcher';

<LanguageSwitcher 
  currentLocale={locale} 
  onLocaleChange={changeLocale} 
/>
```

### 4. Добавление новых переводов

#### Шаг 1: Добавьте ключи в JSON файлы

**ru/landing.json:**
```json
{
  "newSection": {
    "title": "Новый заголовок",
    "description": "Описание"
  }
}
```

**kg/landing.json:**
```json
{
  "newSection": {
    "title": "Жаңы аталыш",
    "description": "Сүрөттөмө"
  }
}
```

#### Шаг 2: Используйте в компоненте

```tsx
const { t } = useTranslation('landing');

<h2>{t.newSection.title}</h2>
<p>{t.newSection.description}</p>
```

### 5. Добавление новой страницы

#### Шаг 1: Создайте JSON файлы

Создайте `dashboard.json` в папках `kg/` и `ru/`:

```json
{
  "title": "Панель управления",
  "stats": {
    "total": "Всего"
  }
}
```

#### Шаг 2: Обновите index.ts

```typescript
import kg_dashboard from './locales/kg/dashboard.json';
import ru_dashboard from './locales/ru/dashboard.json';

export const translations = {
  kg: {
    landing: kg_landing,
    layout: kg_layout,
    dashboard: kg_dashboard, // добавьте
  },
  ru: {
    landing: ru_landing,
    layout: ru_layout,
    dashboard: ru_dashboard, // добавьте
  },
};
```

#### Шаг 3: Используйте в компоненте

```tsx
const { t } = useTranslation('dashboard');
```

### 6. Добавление нового языка

#### Шаг 1: Создайте папку языка

```
app/i18n/locales/en/
├── landing.json
└── layout.json
```

#### Шаг 2: Обновите index.ts

```typescript
export type Locale = 'kg' | 'ru' | 'en'; // добавьте 'en'

export const locales: Locale[] = ['kg', 'ru', 'en']; // добавьте 'en'

import en_landing from './locales/en/landing.json';
import en_layout from './locales/en/layout.json';

export const translations = {
  kg: { ... },
  ru: { ... },
  en: { // добавьте
    landing: en_landing,
    layout: en_layout,
  },
};

export const localeNames: Record<Locale, string> = {
  kg: 'Кыргызча',
  ru: 'Русский',
  en: 'English', // добавьте
};
```

## Особенности реализации

### Сохранение выбранного языка

Выбранный язык автоматически сохраняется в `localStorage` и восстанавливается при следующем посещении.

### TypeScript поддержка

Все переводы типизированы, что обеспечивает автодополнение и проверку типов:

```tsx
// TypeScript подскажет доступные ключи
t.header.appName // ✅
t.header.wrongKey // ❌ Ошибка компиляции
```

### Язык по умолчанию

Если перевод для выбранного языка не найден, автоматически используется русский язык (defaultLocale).

## Примеры использования

### Пример 1: Простой текст

```tsx
<h1>{t.hero.title.part1}</h1>
```

### Пример 2: Массив элементов

```json
{
  "features": {
    "items": {
      "item1": {
        "title": "Заголовок 1",
        "description": "Описание 1"
      },
      "item2": {
        "title": "Заголовок 2",
        "description": "Описание 2"
      }
    }
  }
}
```

```tsx
<FeatureCard
  title={t.features.items.item1.title}
  description={t.features.items.item1.description}
/>
```

### Пример 3: Динамические значения

Для динамических значений используйте шаблонные строки:

```tsx
const userName = "Иван";
<p>{t.welcome.replace('{name}', userName)}</p>
```

JSON:
```json
{
  "welcome": "Привет, {name}!"
}
```

## Рекомендации

1. **Именование ключей**: Используйте понятные английские ключи в camelCase
2. **Структура**: Группируйте переводы по секциям страницы
3. **Консистентность**: Сохраняйте одинаковую структуру во всех языках
4. **Валидация**: Проверяйте JSON на валидность перед коммитом
5. **Длина текста**: Учитывайте, что переводы могут быть разной длины

## Поддерживаемые языки

- 🇷🇺 **Русский (ru)** - язык по умолчанию
- 🇰🇬 **Кыргызский (kg)**

## Тестирование

Чтобы протестировать локализацию:

1. Откройте сайт в браузере
2. Найдите переключатель языков в шапке (иконка глобуса)
3. Переключите язык
4. Проверьте, что все тексты изменились
5. Обновите страницу - язык должен сохраниться
