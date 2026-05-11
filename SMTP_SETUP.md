# Настройка SMTP для отправки email

## Вариант 1: Gmail (Рекомендуется для тестирования)

### Шаг 1: Включите двухфакторную аутентификацию в Google
1. Откройте https://myaccount.google.com/security
2. Включите "2-Step Verification"

### Шаг 2: Создайте App Password
1. Откройте https://myaccount.google.com/apppasswords
2. Выберите "Mail" и "Other (Custom name)"
3. Введите название: "Bite Lens"
4. Нажмите "Generate"
5. Скопируйте сгенерированный пароль (16 символов)

### Шаг 3: Добавьте в .env
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-16-char-app-password"
```

### Шаг 4: Перезапустите сервер
```bash
npm run dev
```

---

## Вариант 2: Другие SMTP провайдеры

### Yandex Mail
```env
SMTP_HOST="smtp.yandex.ru"
SMTP_PORT="587"
SMTP_USER="your-email@yandex.ru"
SMTP_PASSWORD="your-password"
```

### Mail.ru
```env
SMTP_HOST="smtp.mail.ru"
SMTP_PORT="587"
SMTP_USER="your-email@mail.ru"
SMTP_PASSWORD="your-password"
```

### Outlook/Hotmail
```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_USER="your-email@outlook.com"
SMTP_PASSWORD="your-password"
```

### SendGrid (для production)
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
```

---

## Тестирование

1. Откройте http://localhost:3000/settings
2. Нажмите "Включить" 2FA
3. Нажмите "Отправить код на email"
4. Проверьте почту
5. Введите код из письма

---

## Troubleshooting

### Ошибка: "Invalid login"
- Проверьте правильность email и пароля
- Для Gmail используйте App Password, а не обычный пароль

### Ошибка: "Connection timeout"
- Проверьте SMTP_HOST и SMTP_PORT
- Убедитесь что нет блокировки файрволом

### Письмо не приходит
- Проверьте папку "Спам"
- Проверьте логи сервера на ошибки
- Убедитесь что SMTP настройки правильные

### Для разработки без SMTP
Если SMTP не настроен, код будет показан в консоли сервера и в ответе API (только в dev режиме).

---

## Production рекомендации

Для production используйте специализированные сервисы:
- **SendGrid** - 100 писем/день бесплатно
- **Mailgun** - 5000 писем/месяц бесплатно
- **Amazon SES** - очень дешево
- **Resend** - современный API

Не используйте личный Gmail в production!
