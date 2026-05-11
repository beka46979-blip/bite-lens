# 🔐 Настройка Админ-панели Bite Lens

## Обзор

Админ-панель использует отдельную систему аутентификации с двухфакторной проверкой через Telegram Bot.

## Особенности

- ✅ Отдельная система аутентификации (админы и пользователи изолированы)
- ✅ Двухфакторная аутентификация через Telegram
- ✅ Защита маршрутов через middleware
- ✅ Красивый UI с градиентами purple/pink
- ✅ Статистика пользователей и админов
- ✅ Безопасное хранение токенов в httpOnly cookies

## Шаг 1: Создание Telegram Bot

1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot`
3. Следуйте инструкциям и получите **Bot Token**
4. Сохраните токен (например: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

## Шаг 2: Получение Telegram User ID

1. Найдите бота [@userinfobot](https://t.me/userinfobot) в Telegram
2. Отправьте ему любое сообщение
3. Бот вернет ваш **User ID** (например: `123456789`)
4. Сохраните этот ID

## Шаг 3: Настройка базы данных

### 3.1 Добавьте настройки Telegram в таблицу `settings`

```sql
INSERT INTO settings (id, key, value) VALUES 
  (gen_random_uuid(), 'ADMIN_TELEGRAM_BOT_TOKEN', 'ВАШ_BOT_TOKEN'),
  (gen_random_uuid(), 'ADMIN_TELEGRAM_USER_ID', 'ВАШ_USER_ID');
```

Или используйте скрипт:

```bash
node setup-admin-settings.mjs
```

### 3.2 Создайте админа

```bash
# Создать админа с дефолтными данными
node create-admin.mjs

# Или с кастомными данными
node create-admin.mjs admin@example.com MySecurePassword123 SUPER_ADMIN
```

**Роли админов:**
- `SUPER_ADMIN` - полный доступ
- `ADMIN` - стандартный доступ
- `MODERATOR` - ограниченный доступ

## Шаг 4: Проверка настроек

Запустите приложение:

```bash
npm run dev
```

Откройте: http://localhost:3000/admin/login

## Процесс входа

1. Введите email и пароль админа
2. Нажмите "Получить код в Telegram"
3. Проверьте Telegram - вам придет 6-значный код
4. Введите код на странице
5. Вы будете перенаправлены в админ-панель

## Структура файлов

```
app/
├── admin/
│   ├── login/
│   │   ├── page.tsx              # Страница входа админа
│   │   └── AdminLoginForm.tsx    # Форма входа с 2FA
│   └── dashboard/
│       └── page.tsx              # Главная страница админки
├── api/
│   └── admin/
│       └── auth/
│           ├── login/route.ts    # API: отправка кода в Telegram
│           ├── verify/route.ts   # API: проверка кода
│           └── logout/route.ts   # API: выход
lib/
└── auth/
    └── admin.ts                  # Утилита getCurrentAdmin()
middleware.ts                     # Защита маршрутов
```

## Защита маршрутов

Middleware автоматически:
- ✅ Блокирует доступ обычных пользователей к `/admin/*`
- ✅ Блокирует доступ админов к пользовательским страницам
- ✅ Перенаправляет неавторизованных админов на `/admin/login`
- ✅ Перенаправляет авторизованных админов с `/admin/login` на `/admin/dashboard`

## Токены

Админские токены хранятся отдельно от пользовательских:
- `admin_token` - JWT токен (7 дней)
- `admin_refresh_token` - Refresh токен (30 дней)

## Безопасность

- ✅ Пароли хешируются с bcrypt
- ✅ Коды 2FA истекают через 10 минут
- ✅ Токены хранятся в httpOnly cookies
- ✅ Коды удаляются после использования
- ✅ Админы и пользователи полностью изолированы

## Демо-режим

Если Telegram не настроен, система работает в демо-режиме:
- Код отображается в ответе API
- Можно тестировать без Telegram Bot

## Troubleshooting

### Проблема: "Telegram не настроен"

**Решение:** Проверьте, что в таблице `settings` есть записи:
```sql
SELECT * FROM settings WHERE key LIKE 'ADMIN_TELEGRAM%';
```

### Проблема: "Код не приходит в Telegram"

**Решение:**
1. Проверьте Bot Token
2. Убедитесь, что вы отправили `/start` вашему боту
3. Проверьте User ID
4. Посмотрите логи сервера на ошибки

### Проблема: "Неверный код"

**Решение:**
- Код действителен только 10 минут
- Каждый код можно использовать только один раз
- Запросите новый код

### Проблема: "Админ не может войти"

**Решение:**
1. Проверьте, что админ создан в БД:
```sql
SELECT * FROM admins WHERE email = 'ваш@email.com';
```
2. Пересоздайте админа с помощью `create-admin.mjs`

## API Endpoints

### POST `/api/admin/auth/login`
Отправляет 6-значный код в Telegram

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Код отправлен в Telegram",
  "adminId": "uuid"
}
```

### POST `/api/admin/auth/verify`
Проверяет код и создает сессию

**Body:**
```json
{
  "adminId": "uuid",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "admin": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "SUPER_ADMIN"
  }
}
```

### POST `/api/admin/auth/logout`
Удаляет токены и завершает сессию

**Response:**
```json
{
  "success": true
}
```

## Следующие шаги

После настройки админ-панели вы можете:
1. Создать страницы управления пользователями
2. Добавить страницу настроек системы
3. Реализовать управление контентом
4. Добавить аналитику и отчеты

## Поддержка

Если возникли проблемы, проверьте:
1. Логи сервера (`npm run dev`)
2. Консоль браузера (F12)
3. Таблицы БД (`admins`, `settings`, `sessions`)
