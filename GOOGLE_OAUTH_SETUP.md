# Настройка Google OAuth

## Шаг 1: Создание проекта в Google Cloud Console

1. Перейдите на https://console.cloud.google.com/
2. Создайте новый проект или выберите существующий
3. Название проекта: `Bite Lens` (или любое другое)

## Шаг 2: Настройка OAuth Consent Screen

1. В меню слева выберите **APIs & Services** → **OAuth consent screen**
2. Выберите **External** (для тестирования)
3. Заполните обязательные поля:
   - App name: `Bite Lens`
   - User support email: ваш email
   - Developer contact: ваш email
4. Нажмите **Save and Continue**
5. На странице Scopes добавьте:
   - `openid`
   - `email`
   - `profile`
6. Нажмите **Save and Continue**
7. На странице Test users добавьте свой email для тестирования
8. Нажмите **Save and Continue**

## Шаг 3: Создание OAuth 2.0 Credentials

1. Перейдите в **APIs & Services** → **Credentials**
2. Нажмите **Create Credentials** → **OAuth client ID**
3. Выберите **Application type**: **Web application**
4. Название: `Bite Lens Web`
5. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://yourdomain.com (для production)
   ```
6. **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/google/callback
   https://yourdomain.com/api/auth/google/callback (для production)
   ```
7. Нажмите **Create**

## Шаг 4: Копирование credentials

После создания вы увидите:
- **Client ID** - скопируйте в `.env` как `GOOGLE_CLIENT_ID`
- **Client Secret** - скопируйте в `.env` как `GOOGLE_CLIENT_SECRET`

Пример `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bite_lens?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefghijklmnopqrstuvwx"
```

## Шаг 5: Применение миграции БД

Наша схема БД обновлена для поддержки OAuth. Примените миграцию:

```bash
# Если БД запущена
npx prisma migrate deploy

# Или для dev окружения
npx prisma migrate dev
```

## Шаг 6: Тестирование

1. Запустите dev сервер: `npm run dev`
2. Откройте http://localhost:3000/login
3. Нажмите "Войти через Google"
4. Выберите Google аккаунт
5. Разрешите доступ
6. Вы будете перенаправлены на `/profile` (для новых пользователей) или `/dashboard` (для существующих)

## Как это работает

### Регистрация через Google:
1. Пользователь нажимает "Войти через Google"
2. Перенаправление на `/api/auth/google`
3. Google OAuth flow
4. Callback на `/api/auth/google/callback`
5. Создание/обновление пользователя в БД
6. Установка JWT токенов в cookies
7. Перенаправление на `/profile` (если `onboardingCompleted = false`) или `/dashboard`

### Обычная регистрация:
1. Пользователь заполняет email и пароль
2. POST на `/api/auth/register`
3. Создание пользователя с `onboardingCompleted = false`
4. Установка JWT токенов в cookies
5. Перенаправление на `/profile` для заполнения данных

### Страница профиля:
- Пользователь заполняет: имя, пол, дату рождения, рост, вес, целевой вес, уровень активности
- Система автоматически рассчитывает дневную норму калорий по формуле Миффлина-Сан Жеора
- После сохранения `onboardingCompleted = true` и перенаправление на `/dashboard`

## Проверка в БД

```sql
-- Проверить пользователей созданных через Google
SELECT id, email, name, "googleId", "isEmailVerified", "onboardingCompleted", "createdAt" 
FROM users 
WHERE "googleId" IS NOT NULL;

-- Проверить пользователей с обычной регистрацией
SELECT id, email, name, "passwordHash", "onboardingCompleted", "createdAt" 
FROM users 
WHERE "googleId" IS NULL;
```

## Troubleshooting

### Ошибка "redirect_uri_mismatch"
- Проверьте что redirect URI в Google Console точно совпадает
- Должен быть: `http://localhost:3000/api/auth/google/callback`
- Убедитесь что нет trailing slash

### Ошибка "Access blocked: This app's request is invalid"
- Добавьте свой email в Test users в Google Console
- Проверьте что добавлены правильные scopes: openid, email, profile

### Ошибка "Invalid client"
- Проверьте GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET в .env
- Убедитесь что нет лишних пробелов или кавычек

### База данных не подключается
- Запустите PostgreSQL
- Проверьте DATABASE_URL в .env
- Выполните миграции: `npx prisma migrate deploy`

## Production

Для production:
1. Добавьте production URL в Authorized origins и redirect URIs в Google Console
2. Обновите `NEXT_PUBLIC_APP_URL` в .env на production URL
3. Опубликуйте OAuth consent screen в Google Console (Publish App)
4. Используйте безопасные секреты для JWT_SECRET
5. Включите HTTPS

## Архитектура аутентификации

```
┌─────────────────┐
│  User Browser   │
└────────┬────────┘
         │
         ├─── /login, /register (страницы)
         │
         ├─── /api/auth/register (обычная регистрация)
         │    └─→ Создает user с passwordHash
         │
         ├─── /api/auth/login (обычный логин)
         │    └─→ Проверяет passwordHash
         │
         ├─── /api/auth/google (OAuth инициализация)
         │    └─→ Redirect на Google
         │
         └─── /api/auth/google/callback (OAuth callback)
              └─→ Создает/обновляет user с googleId
              
┌─────────────────┐
│   Middleware    │ ← Проверяет JWT токен в cookies
└─────────────────┘
         │
         ├─→ /profile (заполнение данных)
         └─→ /dashboard (главная страница)
```

## Полезные ссылки

- Google Cloud Console: https://console.cloud.google.com/
- Google OAuth Guide: https://developers.google.com/identity/protocols/oauth2
- Prisma Docs: https://www.prisma.io/docs
