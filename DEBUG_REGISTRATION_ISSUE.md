# 🐛 Отладка проблемы с регистрацией

## Проблема
После нажатия "Зарегистрироваться" пользователя перенаправляет на страницу входа (`/login`) вместо страницы подтверждения email (`/verify-email`).

## Что мы видим в логах
```
POST /api/auth/register 200 in 364ms
GET /login 200 in 125ms  ← ПРОБЛЕМА: должно быть GET /verify-email
```

## Что было сделано

### 1. Добавлено логирование
- ✅ В `RegisterForm.tsx` - логи в браузере
- ✅ В `/api/auth/register` - логи на сервере
- ✅ В `getPendingUser()` - логи проверки токена
- ✅ В `/verify-email/page.tsx` - логи страницы

### 2. Изменен способ редиректа
**Было:**
```typescript
router.push('/verify-email');
router.refresh();
```

**Стало:**
```typescript
window.location.href = '/verify-email';
```

Причина: `window.location.href` гарантирует, что cookie будут установлены перед редиректом.

## Как протестировать

### Шаг 1: Откройте консоль браузера
1. Откройте http://localhost:3000/register
2. Откройте DevTools (F12)
3. Перейдите на вкладку "Console"

### Шаг 2: Зарегистрируйтесь
1. Введите email и пароль
2. Нажмите "Зарегистрироваться"
3. Смотрите логи в консоли

### Ожидаемые логи в консоли браузера:
```
🔄 Отправка запроса на регистрацию...
📦 Ответ от сервера: { status: true, data: { success: true, email: "...", verificationCode: "123456" } }
✅ Регистрация успешна, перенаправление на /verify-email
```

### Ожидаемые логи на сервере (терминал):
```
✅ Регистрация успешна: test@example.com
🔑 Создан tempToken для: test@example.com
📧 Код верификации: 123456
🍪 tempToken cookie установлен
```

### Ожидаемые логи при загрузке /verify-email:
```
📄 Загрузка страницы /verify-email
🔍 getPendingUser: tempToken = найден
🔓 JWT payload: { email: "test@example.com", isPending: true }
✅ Pending user найден: test@example.com
📝 pendingReg: найдена
✅ Все проверки пройдены, показываем форму верификации
```

## Возможные причины проблемы

### 1. Cookie не устанавливается
- Проверить: есть ли `tempToken` в cookies после регистрации
- Открыть DevTools → Application → Cookies → http://localhost:3000
- Должен быть cookie `tempToken`

### 2. Редирект происходит до установки cookie
- Решение: используем `window.location.href` вместо `router.push()`

### 3. Ошибка в API регистрации
- Проверить: возвращает ли API `success: true`
- Смотреть логи в консоли браузера

### 4. Проблема с JWT
- Проверить: правильно ли создается и верифицируется JWT
- Смотреть логи `getPendingUser()`

## Следующие шаги

1. **Проверить консоль браузера** - есть ли логи?
2. **Проверить cookies** - установлен ли `tempToken`?
3. **Проверить Network tab** - что возвращает `/api/auth/register`?
4. **Проверить терминал** - есть ли логи на сервере?

## Быстрый тест

Выполните в консоли браузера после регистрации:
```javascript
// Проверить наличие tempToken
document.cookie.split(';').find(c => c.trim().startsWith('tempToken='))

// Если есть, должно вернуть что-то вроде:
// "tempToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Если `tempToken` нет - проблема в установке cookie.
Если `tempToken` есть - проблема в редиректе или в странице `/verify-email`.
