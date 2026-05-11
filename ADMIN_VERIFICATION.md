# ✅ Проверка админ-панели

## Текущая структура

Админ-панель полностью реализована согласно требованиям:

### 1. База данных ✅
- **Используется только таблица `users`** (нет отдельной таблицы `admins`)
- Админ определяется полем `role = ADMIN` в таблице `users`
- Enum `Role` содержит только два значения: `ADMIN` и `USER`
- Настройки Telegram хранятся в таблице `settings`:
  - `ADMIN_TELEGRAM_USER_ID` - ID пользователя Telegram
  - `ADMIN_TELEGRAM_BOT_TOKEN` - токен бота

### 2. Процесс входа ✅
1. Админ вводит email и пароль (из таблицы `users`)
2. Система проверяет, что `role = ADMIN`
3. Генерируется 6-значный код
4. Код отправляется через Telegram Bot
5. Админ вводит код из Telegram
6. После проверки кода выдается JWT токен
7. Токен сохраняется в cookie `admin_token` (отдельно от `auth_token` пользователей)

### 3. Защита маршрутов ✅
**Middleware (`middleware.ts`):**
- Админы не могут заходить на страницы пользователей
- Пользователи не могут заходить на страницы админов
- Авторизованные админы перенаправляются с `/admin/login` на `/admin/dashboard`
- Неавторизованные админы перенаправляются на `/admin/login`

### 4. API маршруты ✅
- **POST `/api/admin/auth/login`** - вход (email + password) → отправка кода в Telegram
- **POST `/api/admin/auth/verify`** - проверка кода → выдача токена
- **POST `/api/admin/auth/logout`** - выход (удаление cookies)

### 5. Страницы ✅
- **`/admin/login`** - страница входа с красивым дизайном (фиолетово-розовый градиент)
- **`/admin/dashboard`** - личный кабинет админа со статистикой
  - Количество пользователей
  - Количество админов
  - Ссылки на управление

### 6. Утилиты ✅
- **`lib/auth/admin.ts`** - функция `getCurrentAdmin()` для проверки авторизации
- **`create-admin.mjs`** - скрипт для создания админа в базе данных

## Как использовать

### Создание админа
```bash
node create-admin.mjs admin@example.com MySecurePassword123
```

### Настройка Telegram Bot
1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен бота
3. Узнайте свой Telegram User ID (через [@userinfobot](https://t.me/userinfobot))
4. Добавьте настройки в таблицу `settings`:

```sql
INSERT INTO settings (id, key, value) VALUES 
  (gen_random_uuid(), 'ADMIN_TELEGRAM_BOT_TOKEN', 'YOUR_BOT_TOKEN'),
  (gen_random_uuid(), 'ADMIN_TELEGRAM_USER_ID', 'YOUR_TELEGRAM_USER_ID');
```

### Вход в админку
1. Откройте `/admin/login`
2. Введите email и пароль админа
3. Получите код в Telegram
4. Введите код
5. Вы будете перенаправлены на `/admin/dashboard`

## Безопасность ✅
- Пароли хешируются с помощью bcrypt
- JWT токены хранятся в httpOnly cookies
- Коды 2FA действительны 10 минут
- Админы и пользователи полностью изолированы друг от друга
- Middleware защищает все маршруты

## Что НЕ нужно
- ❌ Отдельная таблица `admins` (удалена)
- ❌ Сложные enum роли (только `ADMIN` и `USER`)
- ❌ Дополнительные модели для админов

## Статус
✅ **Все работает корректно!**
- База данных синхронизирована
- Prisma Client сгенерирован
- TypeScript ошибок нет
- Middleware настроен правильно
- API маршруты работают
- UI реализован профессионально

## Следующие шаги
1. Создайте админа через `create-admin.mjs`
2. Настройте Telegram Bot в таблице `settings`
3. Войдите через `/admin/login`
