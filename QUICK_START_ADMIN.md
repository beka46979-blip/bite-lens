# 🚀 Быстрый старт: Админ-панель

## ✅ Что уже готово

Админ-панель **полностью реализована** и готова к использованию!

### Реализованные компоненты:

1. **Страницы**
   - `/admin/login` - вход для админов
   - `/admin/dashboard` - главная страница админки

2. **API**
   - `POST /api/admin/auth/login` - отправка кода в Telegram
   - `POST /api/admin/auth/verify` - проверка кода
   - `POST /api/admin/auth/logout` - выход

3. **Защита**
   - Middleware изолирует админов и пользователей
   - Админы не могут заходить на user-страницы
   - Пользователи не могут заходить на admin-страницы

4. **База данных**
   - Таблица `admins` (email, password, role)
   - Таблица `settings` (для Telegram Bot)

## 📝 Настройка за 3 шага

### Шаг 1: Создайте Telegram Bot

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot` и следуйте инструкциям
3. Сохраните **Bot Token** (например: `1234567890:ABC...`)
4. Найдите [@userinfobot](https://t.me/userinfobot)
5. Получите свой **User ID** (например: `123456789`)

### Шаг 2: Добавьте настройки в БД

Выполните SQL:

```sql
INSERT INTO settings (id, key, value) VALUES 
  (gen_random_uuid(), 'ADMIN_TELEGRAM_BOT_TOKEN', 'ВАШ_BOT_TOKEN_ЗДЕСЬ'),
  (gen_random_uuid(), 'ADMIN_TELEGRAM_USER_ID', 'ВАШ_USER_ID_ЗДЕСЬ');
```

**Или используйте скрипт:**

```bash
node setup-admin-settings.mjs
```

### Шаг 3: Создайте админа

Выполните SQL:

```sql
-- Пароль: Admin123!
INSERT INTO admins (id, email, password_hash, role) VALUES 
  (gen_random_uuid(), 
   'admin@bitelens.com', 
   '$2a$10$YourHashedPasswordHere',
   'SUPER_ADMIN');
```

**Или используйте скрипт:**

```bash
# С дефолтными данными (admin@bitelens.com / Admin123!)
node create-admin.mjs

# Или с кастомными
node create-admin.mjs your@email.com YourPassword123 SUPER_ADMIN
```

## 🎯 Готово! Запускайте

```bash
npm run dev
```

Откройте: **http://localhost:3000/admin/login**

## 🔐 Процесс входа

1. Введите email и пароль
2. Нажмите "Получить код в Telegram"
3. Проверьте Telegram - придет 6-значный код
4. Введите код
5. Вы в админ-панели! 🎉

## 💡 Демо-режим

Если Telegram не настроен, система работает в демо-режиме:
- Код отображается в ответе API
- Можно тестировать без бота

## 📊 Что показывает Dashboard

- Количество пользователей
- Количество админов
- Информация о текущем админе
- Кнопка выхода

## 🛡️ Безопасность

- ✅ Пароли хешируются с bcrypt
- ✅ 2FA через Telegram
- ✅ JWT токены в httpOnly cookies
- ✅ Коды истекают через 10 минут
- ✅ Полная изоляция админов и пользователей

## 🔧 Роли админов

- `SUPER_ADMIN` - полный доступ
- `ADMIN` - стандартный доступ
- `MODERATOR` - ограниченный доступ

## ❓ Проблемы?

### "Telegram не настроен"
→ Добавьте настройки в таблицу `settings`

### "Неверный email или пароль"
→ Создайте админа через `create-admin.mjs`

### "Код не приходит"
→ Проверьте Bot Token и отправьте `/start` боту

### "Код истек"
→ Запросите новый код (действителен 10 минут)

## 📚 Документация

Подробная документация:
- `ADMIN_SETUP.md` - полная инструкция
- `ADMIN_PANEL_COMPLETE.md` - технические детали

## 🎨 Дизайн

- Градиенты purple/pink
- Glassmorphism эффекты
- Адаптивный дизайн
- Красивые анимации

## 🚀 Следующие шаги

После настройки можно добавить:
- Управление пользователями
- Управление админами
- Настройки системы
- Аналитику и отчеты

---

**Админ-панель готова к использованию!** 🎉

Просто настройте Telegram Bot, создайте админа и начинайте работать!
