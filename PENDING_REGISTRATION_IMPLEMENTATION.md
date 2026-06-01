# Реализация системы Pending Registration

## 📋 Обзор

Система pending registration позволяет создавать аккаунты пользователей **только после подтверждения email**. До подтверждения данные хранятся во временной таблице `pending_registrations`.

## ✅ Что было сделано

### 1. База данных

#### Создана таблица `pending_registrations`
```sql
CREATE TABLE pending_registrations (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  verification_code VARCHAR(10) NOT NULL,
  code_expires_at TIMESTAMP(6) NOT NULL,
  created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

**Файлы:**
- `prisma/schema.prisma` - добавлена модель `pending_registrations`
- `create-pending-registrations.sql` - SQL миграция
- `apply-pending-registrations-migration.mjs` - скрипт применения миграции
- ✅ Миграция успешно применена

### 2. API Routes

#### `/api/auth/register` (обновлен)
- **Изменение:** Теперь сохраняет данные в `pending_registrations` вместо создания пользователя
- **Возвращает:** `tempToken` cookie для доступа к странице верификации
- **Не создает:** Пользователя в таблице `users`

#### `/api/auth/verify-email/send-code` (обновлен)
- **Изменение:** Работает с `pending_registrations` и `tempToken`
- **Функция:** Генерирует и отправляет 6-значный код на email
- **Обновляет:** Код и срок действия в `pending_registrations`

#### `/api/auth/verify-email/verify` (обновлен)
- **Изменение:** Создает пользователя ПОСЛЕ успешной верификации кода
- **Процесс:**
  1. Проверяет код из `pending_registrations`
  2. Создает пользователя в таблице `users` с `is_email_verified: true`
  3. Создает сессию и подписку
  4. Удаляет запись из `pending_registrations`
  5. Удаляет `tempToken` и устанавливает настоящие auth cookies

#### `/api/auth/clear-temp-token` (существующий)
- **Функция:** Очищает временный токен
- **Используется:** При нажатии "Изменить email или пароль"

#### `/api/auth/delete-unverified` (удален)
- **Причина:** Больше не нужен, так как пользователь не создается до верификации

### 3. Frontend компоненты

#### `app/verify-email/page.tsx` (обновлен)
- **Изменение:** Использует `getPendingUser()` вместо `getCurrentUser()`
- **Проверяет:** Наличие `tempToken` и записи в `pending_registrations`
- **Редирект:** На `/register` если нет pending регистрации

#### `app/verify-email/VerifyEmailForm.tsx` (обновлен)
- **Упрощена функция `handleGoBack()`:**
  - Просто очищает `tempToken` через API
  - Перенаправляет на `/register`
  - **НЕ удаляет** ничего (аккаунт еще не создан)
  - Убрано состояние `isLoading` для кнопки
  - Убран текст "Удаление..."

#### `app/verify-email/ResendCodeButton.tsx` (без изменений)
- Уже работает с новым API `/api/auth/verify-email/send-code`

### 4. Вспомогательные функции

#### `lib/auth/session.ts` (обновлен)
- **Добавлена функция:** `getPendingUser()`
- **Возвращает:** `{ email, isPending }` из `tempToken`
- **Используется:** На странице верификации email

#### `lib/auth/cookies.ts` (существующий)
- Уже содержит `getTempToken()` и `clearTempToken()`

## 🔄 Поток регистрации

### Старый поток (до изменений)
```
1. Регистрация → Создание пользователя (is_email_verified: false)
2. Верификация → Обновление is_email_verified: true
3. "Изменить email" → Удаление пользователя
```

### Новый поток (после изменений)
```
1. Регистрация → Сохранение в pending_registrations + tempToken
2. Верификация → Создание пользователя (is_email_verified: true)
3. "Изменить email" → Очистка tempToken + редирект (ничего не удаляется)
```

## 🎯 Преимущества

1. **Нет неподтвержденных пользователей** в основной таблице `users`
2. **Простое изменение данных** - пользователь может вернуться и изменить email/пароль
3. **Чистая база данных** - только подтвержденные аккаунты
4. **Безопасность** - временные данные автоматически истекают через 15 минут

## 🧪 Тестирование

Создан тест `test-pending-registration-flow.mjs` который проверяет:
- ✅ Создание pending регистрации
- ✅ Поиск pending регистрации
- ✅ Пользователь не создается до верификации
- ✅ Создание пользователя после верификации
- ✅ Удаление pending регистрации

**Результат:** Все тесты пройдены успешно ✅

## 📝 Использование

### Для пользователя:

1. **Регистрация:**
   - Заполнить форму на `/register`
   - Нажать "Зарегистрироваться"
   - Автоматический редирект на `/verify-email`

2. **Верификация:**
   - Ввести 6-значный код из email
   - Или нажать "Отправить код повторно"
   - После успешной верификации → редирект в `/profile`

3. **Изменение данных:**
   - Нажать "Изменить email или пароль"
   - Вернуться на `/register` с пустой формой
   - Зарегистрироваться заново

### Для разработчика:

```bash
# Применить миграцию (уже выполнено)
node apply-pending-registrations-migration.mjs

# Запустить тесты
node test-pending-registration-flow.mjs

# Запустить dev сервер
npm run dev
```

## 🔧 Технические детали

### Временный токен (tempToken)
- **Срок действия:** 1 час
- **Содержит:** `{ email, isPending: true }`
- **Используется:** Для доступа к `/verify-email`
- **Очищается:** При успешной верификации или при нажатии "Изменить email"

### Код верификации
- **Формат:** 6 цифр (100000-999999)
- **Срок действия:** 15 минут
- **Хранится:** В `pending_registrations.verification_code`
- **Обновляется:** При повторной отправке

### Безопасность
- Пароли хешируются перед сохранением в `pending_registrations`
- Временные токены подписываются JWT
- Коды верификации истекают через 15 минут
- Pending регистрации можно очистить автоматически (cron job)

## 📂 Измененные файлы

### База данных
- `prisma/schema.prisma`
- `create-pending-registrations.sql`
- `apply-pending-registrations-migration.mjs`

### API Routes
- `app/api/auth/register/route.ts`
- `app/api/auth/verify-email/send-code/route.ts`
- `app/api/auth/verify-email/verify/route.ts`
- ~~`app/api/auth/delete-unverified/route.ts`~~ (удален)

### Frontend
- `app/verify-email/page.tsx`
- `app/verify-email/VerifyEmailForm.tsx`

### Helpers
- `lib/auth/session.ts`

### Тесты
- `test-pending-registration-flow.mjs` (новый)

## ✨ Статус

**🎉 Система полностью реализована и протестирована!**

Все компоненты работают корректно:
- ✅ Миграция применена
- ✅ API routes обновлены
- ✅ Frontend компоненты обновлены
- ✅ Тесты пройдены
- ✅ Dev сервер запущен

Система готова к использованию!
