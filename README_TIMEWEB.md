# 🚀 Деплой Bite Lens на Timeweb App Platform

> Полная документация и инструкции для деплоя Next.js приложения на Timeweb

## 📖 Навигация по документации

### 🎯 Быстрый старт
- **[БЫСТРЫЙ_СТАРТ.md](БЫСТРЫЙ_СТАРТ.md)** ⭐ - Деплой за 15 минут (начните отсюда!)
- **[ШПАРГАЛКА.md](ШПАРГАЛКА.md)** - Краткая справка по командам и переменным

### 📚 Подробная документация
- **[README_DEPLOY.md](README_DEPLOY.md)** - Подробная инструкция по деплою
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Полное руководство со всеми деталями
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Чеклист для проверки всех шагов
- **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** - Техническая сводка и архитектура

### 🐳 Docker
- **[DOCKER_FILES_OVERVIEW.md](DOCKER_FILES_OVERVIEW.md)** - Обзор всех Docker файлов
- **[docker-commands.md](docker-commands.md)** - Справочник Docker команд
- **Dockerfile** - Оптимизированный multi-stage образ (используется по умолчанию)
- **Dockerfile.simple** - Упрощенная версия (запасной вариант)

### 🛠 Утилиты
- **[generate-jwt-secret.js](generate-jwt-secret.js)** - Генератор безопасного JWT_SECRET
- **[check-env.js](check-env.js)** - Проверка переменных окружения
- **[.env.timeweb.template](.env.timeweb.template)** - Шаблон переменных для Timeweb

### 📊 Итоговая информация
- **[ГОТОВО_К_ДЕПЛОЮ.md](ГОТОВО_К_ДЕПЛОЮ.md)** - Резюме всех изменений и следующие шаги

---

## ⚡ Быстрый старт (3 шага)

### 1. Подготовка (5 минут)
```bash
# Сгенерируйте JWT_SECRET
npm run generate:jwt

# Создайте:
# - PostgreSQL базу данных
# - S3 бакет в Timeweb Cloud Storage
# - Google OAuth credentials
```

### 2. Деплой (10 минут)
1. Откройте [Timeweb App Platform](https://timeweb.cloud/app-platform)
2. Создайте приложение и подключите репозиторий
3. Добавьте переменные окружения (см. `.env.timeweb.template`)
4. Запустите деплой

### 3. Проверка (5 минут)
```bash
# Health check
curl https://your-app.timeweb.cloud/api/health

# Используйте чеклист
DEPLOYMENT_CHECKLIST.md
```

---

## 📦 Что было создано

### Docker конфигурация
- ✅ Dockerfile (multi-stage, оптимизированный)
- ✅ Dockerfile.simple (упрощенная версия)
- ✅ .dockerignore (оптимизация сборки)

### Документация (12 файлов)
- ✅ Быстрый старт на русском
- ✅ Подробные инструкции
- ✅ Чеклисты и шпаргалки
- ✅ Техническая документация

### Утилиты
- ✅ Генератор JWT_SECRET
- ✅ Проверка переменных окружения
- ✅ Шаблон переменных для Timeweb

### Мониторинг
- ✅ Health check endpoint (`/api/health`)

### CI/CD
- ✅ GitHub Actions для проверки сборки Docker

### Обновления
- ✅ next.config.ts (standalone режим)
- ✅ package.json (новые скрипты)

---

## 🎯 NPM скрипты

```bash
# Генерация JWT_SECRET
npm run generate:jwt

# Проверка переменных окружения
npm run check:env

# Локальное тестирование Docker
npm run docker:build
npm run docker:run

# Проверка перед деплоем
npm run deploy:check
```

---

## 🔑 Переменные окружения

Все необходимые переменные с подробными комментариями находятся в:
- **[.env.timeweb.template](.env.timeweb.template)**

Краткий список:
```bash
DATABASE_URL              # PostgreSQL (внешняя БД)
JWT_SECRET                # Сгенерируйте: npm run generate:jwt
NEXT_PUBLIC_APP_URL       # URL приложения от Timeweb
GOOGLE_CLIENT_ID          # Google OAuth
GOOGLE_CLIENT_SECRET      # Google OAuth
SMTP_HOST/PORT/USER/PASS  # Email для 2FA
OPENAI_API_KEY            # Анализ фотографий еды
S3_*                      # Timeweb Cloud Storage
NODE_ENV=production       # Production режим
```

---

## 🏗 Архитектура

```
GitHub/GitLab
    ↓
Timeweb App Platform
    ↓
Docker Container (Node.js 20)
    ↓
Next.js App + Prisma
    ↓
Nginx + SSL
    ↓
Internet
```

### Внешние зависимости
- PostgreSQL (база данных)
- S3 Storage (изображения)
- Google OAuth (аутентификация)
- OpenAI API (анализ фото)
- SMTP (email)

---

## 🔍 Проверка работы

### Health Check
```bash
curl https://your-app.timeweb.cloud/api/health
```

Ожидаемый ответ:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected",
  "environment": "production"
}
```

### Логи
Панель Timeweb → Ваше приложение → Логи

---

## 🆘 Troubleshooting

### Ошибка сборки Docker
```bash
# Используйте упрощенный Dockerfile
mv Dockerfile Dockerfile.multi-stage
mv Dockerfile.simple Dockerfile
git commit -am "Use simple Dockerfile"
git push
```

### Проблемы с переменными
```bash
# Проверьте все переменные
npm run check:env
```

### Ошибка подключения к БД
- Проверьте `DATABASE_URL`
- Убедитесь что БД доступна из Timeweb
- Проверьте логи в панели Timeweb

### Google OAuth не работает
- Проверьте redirect URI в Google Console
- Убедитесь что `NEXT_PUBLIC_APP_URL` правильный

---

## 📚 Полезные ссылки

### Timeweb
- [App Platform](https://timeweb.cloud/app-platform)
- [Cloud Storage](https://timeweb.cloud/storage)
- [Cloud Database](https://timeweb.cloud/database)
- [Документация](https://timeweb.cloud/docs/app-platform)
- [Поддержка](https://timeweb.cloud/support)

### Внешние сервисы
- [Google Cloud Console](https://console.cloud.google.com/)
- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [Gmail App Passwords](https://myaccount.google.com/apppasswords)

### Документация технологий
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

## 🔒 Безопасность

- ✅ Файл `.env` НЕ попадает в Git
- ✅ Переменные передаются через Timeweb UI
- ✅ Docker контейнер запускается от непривилегированного пользователя
- ✅ SSL-сертификат выпускается автоматически
- ✅ Используйте сильный JWT_SECRET (64+ символов)

---

## 🔄 Автоматические обновления

При каждом `git push` в отслеживаемую ветку Timeweb автоматически:
1. Подтягивает новый код
2. Собирает Docker образ
3. Применяет миграции БД
4. Запускает обновленную версию

---

## ✅ Чеклист деплоя

Используйте **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** для проверки всех шагов.

Краткий чеклист:
- [ ] PostgreSQL БД создана
- [ ] S3 бакет создан
- [ ] JWT_SECRET сгенерирован
- [ ] Google OAuth настроен
- [ ] Все переменные добавлены в Timeweb
- [ ] Деплой запущен
- [ ] URL обновлен
- [ ] Health check работает

---

## 🎉 Готово к деплою!

Все файлы созданы и настроены. Ваш проект полностью готов к деплою на Timeweb App Platform!

**Начните с:** [БЫСТРЫЙ_СТАРТ.md](БЫСТРЫЙ_СТАРТ.md) ⭐

---

## 📞 Поддержка

Если возникли вопросы:
1. Проверьте документацию в этой папке
2. Посмотрите логи в панели Timeweb
3. Обратитесь в [поддержку Timeweb](https://timeweb.cloud/support)

---

**Версия:** 1.0  
**Дата:** $(date)  
**Платформа:** Timeweb App Platform  
**Framework:** Next.js 16.2.4  
**Node.js:** 20 Alpine  
**Database:** PostgreSQL (external)
