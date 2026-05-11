# Система аутентификации

## Реализованные функции

✅ Регистрация пользователей (email + password)
✅ Вход в систему
✅ Выход из системы
✅ JWT токены (access + refresh)
✅ Защита маршрутов через middleware
✅ Хранение токенов в httpOnly cookies
✅ Сессии в БД
✅ Локализация (русский и кыргызский)
✅ Переключатель языков в header

## Структура

```
app/
├── (auth)/
│   ├── login/
│   │   ├── page.tsx          # Страница входа
│   │   └── LoginForm.tsx     # Форма входа
│   └── register/
│       ├── page.tsx          # Страница регистрации
│       └── RegisterForm.tsx  # Форма регистрации
├── api/auth/
│   ├── login/route.ts        # API вход
│   ├── register/route.ts     # API регистрация
│   └── logout/route.ts       # API выход
├── dashboard/
│   ├── page.tsx              # Защищенная страница
│   └── LogoutButton.tsx      # Кнопка выхода
└── i18n/
    ├── locales/
    │   ├── kg/auth.json      # Переводы на кыргызский
    │   └── ru/auth.json      # Переводы на русский
    ├── cookies.ts            # Работа с cookies для языка
    └── actions.ts            # Server actions для смены языка

lib/auth/
├── jwt.ts                    # JWT токены
├── cookies.ts                # Auth cookies
├── session.ts                # Сессии
└── password.ts               # Хеширование паролей

middleware.ts                 # Защита маршрутов
```

## Использование

### Регистрация
1. Перейти на `/register`
2. Ввести email и пароль
3. После успешной регистрации → редирект на `/dashboard`

### Вход
1. Перейти на `/login`
2. Ввести email и пароль
3. После успешного входа → редирект на `/dashboard`

### Выход
1. На странице dashboard нажать кнопку "Выйти"
2. Токены удаляются, сессия закрывается
3. Редирект на `/login`

### Защита маршрутов

Middleware автоматически:
- Перенаправляет неавторизованных пользователей на `/login`
- Перенаправляет авторизованных с `/login` и `/register` на `/dashboard`

### Получение текущего пользователя

```typescript
import { getCurrentUser } from '@/lib/auth/session';

const user = await getCurrentUser();
// { userId: string, email: string } | null
```

### Требование авторизации

```typescript
import { requireAuth } from '@/lib/auth/session';

const user = await requireAuth();
// Выбросит ошибку если не авторизован
```

## Локализация

### Смена языка
- Переключатель в header (иконка глобуса)
- Язык сохраняется в cookie `NEXT_LOCALE`
- Поддерживаемые языки: `ru`, `kg`

### Добавление переводов

Файлы: `app/i18n/locales/{lang}/auth.json`

```json
{
  "login": {
    "title": "Заголовок",
    "errors": {
      "invalidCredentials": "Ошибка"
    }
  }
}
```

## Cookies

### Auth cookies
- `auth_token` - JWT access token (7 дней)
- `refresh_token` - JWT refresh token (30 дней)
- httpOnly, secure (в production), sameSite: lax

### Locale cookie
- `NEXT_LOCALE` - выбранный язык (`ru` | `kg`)
- 1 год, sameSite: lax

## Безопасность

✅ Пароли хешируются с bcrypt (10 rounds)
✅ JWT токены подписаны секретом
✅ Cookies httpOnly (недоступны из JS)
✅ Middleware защищает маршруты
✅ Сессии хранятся в БД
✅ Валидация данных с Zod

## Переменные окружения

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
```

## Google OAuth (TODO)

Подготовлены кнопки "Войти через Google" в формах.
Для реализации нужно:
1. Настроить Google OAuth в Google Cloud Console
2. Добавить GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET в .env
3. Создать API route для OAuth callback
4. Реализовать обработку OAuth токенов
