# 🚀 Деплой на Timeweb App Platform

> Этот проект готов к деплою на Timeweb App Platform с использованием Docker.

## 📖 Документация по деплою

Вся документация находится в корне проекта:

### 🎯 Начните отсюда
- **[README_TIMEWEB.md](README_TIMEWEB.md)** - Главный файл с навигацией по всей документации
- **[БЫСТРЫЙ_СТАРТ.md](БЫСТРЫЙ_СТАРТ.md)** ⭐ - Деплой за 15 минут
- **[ШПАРГАЛКА.md](ШПАРГАЛКА.md)** - Краткая справка

### 📚 Полная документация
- [README_DEPLOY.md](README_DEPLOY.md) - Подробная инструкция
- [DEPLOYMENT.md](DEPLOYMENT.md) - Полное руководство
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Чеклист
- [DOCKER_FILES_OVERVIEW.md](DOCKER_FILES_OVERVIEW.md) - Обзор Docker файлов

## ⚡ Быстрый старт

```bash
# 1. Сгенерируйте JWT_SECRET
npm run generate:jwt

# 2. Создайте внешние сервисы:
#    - PostgreSQL база данных
#    - S3 бакет в Timeweb Cloud Storage
#    - Google OAuth credentials

# 3. Задеплойте на Timeweb App Platform
#    https://timeweb.cloud/app-platform
```

## 🔑 Переменные окружения

Шаблон всех необходимых переменных: [.env.timeweb.template](.env.timeweb.template)

## 🐳 Docker

Проект использует оптимизированный multi-stage Dockerfile:
- Автоматическое применение миграций БД
- Минимальный размер образа
- Node.js 20 Alpine

## 📞 Поддержка

- [Timeweb App Platform](https://timeweb.cloud/app-platform)
- [Документация Timeweb](https://timeweb.cloud/docs/app-platform)
- [Поддержка Timeweb](https://timeweb.cloud/support)

---

**Полная документация:** [README_TIMEWEB.md](README_TIMEWEB.md)
