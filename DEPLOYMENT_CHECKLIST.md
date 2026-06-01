# Чеклист деплоя на Timeweb App Platform

## ✅ Перед деплоем

- [ ] Создана внешняя PostgreSQL база данных
- [ ] Получена строка подключения `DATABASE_URL`
- [ ] Создан S3 бакет в Timeweb Cloud Storage
- [ ] Получены S3 credentials (Access Key, Secret Key)
- [ ] Настроены Google OAuth credentials
- [ ] Получен OpenAI API ключ
- [ ] Настроен SMTP для отправки email
- [ ] Сгенерирован сильный `JWT_SECRET` (минимум 32 символа)
- [ ] Файл `.env` НЕ добавлен в Git (проверьте `.gitignore`)
- [ ] Код закоммичен и запушен в GitHub/GitLab/Bitbucket

## ✅ Настройка в Timeweb

- [ ] Создано приложение в App Platform
- [ ] Подключен репозиторий
- [ ] Выбрана правильная ветка (main/master)
- [ ] Timeweb обнаружил Dockerfile
- [ ] Добавлены все переменные окружения:
  - [ ] `DATABASE_URL`
  - [ ] `JWT_SECRET`
  - [ ] `NEXT_PUBLIC_APP_URL`
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
  - [ ] `OPENAI_API_KEY`
  - [ ] `S3_ENDPOINT`, `S3_BUCKET_NAME`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_REGION`
  - [ ] `NODE_ENV=production`
- [ ] Включен автодеплой
- [ ] Запущен первый деплой

## ✅ После деплоя

- [ ] Приложение успешно запустилось
- [ ] Получен технический домен от Timeweb
- [ ] Обновлен `NEXT_PUBLIC_APP_URL` в переменных окружения
- [ ] Добавлен redirect URI в Google OAuth:
  - `https://your-app.timeweb.cloud/api/auth/google/callback`
- [ ] Проверена главная страница
- [ ] Проверена регистрация пользователя
- [ ] Проверен вход через Google
- [ ] Проверена отправка email (2FA)
- [ ] Проверена загрузка изображений в S3
- [ ] Проверены логи на наличие ошибок

## ✅ Опционально

- [ ] Привязан собственный домен
- [ ] Настроены DNS записи
- [ ] SSL-сертификат выпущен автоматически
- [ ] Настроен мониторинг
- [ ] Настроены алерты на ошибки
- [ ] Создан бэкап базы данных

## 🚀 Готово к продакшену!

Ваше приложение успешно задеплоено на Timeweb App Platform.

### Полезные ссылки:
- Панель управления: https://timeweb.cloud/
- Документация: https://timeweb.cloud/docs/app-platform
- Техподдержка: https://timeweb.cloud/support
