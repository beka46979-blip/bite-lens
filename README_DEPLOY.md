# 🚀 Быстрый старт: Деплой на Timeweb

## Что было создано

✅ **Dockerfile** - оптимизированный multi-stage образ для production  
✅ **Dockerfile.simple** - упрощенная версия (запасной вариант)  
✅ **.dockerignore** - исключает ненужные файлы из образа  
✅ **next.config.ts** - обновлен с поддержкой standalone режима  

## Быстрая инструкция

### 1. Подготовка (5 минут)

**Создайте внешнюю PostgreSQL базу данных:**
- Timeweb Cloud Database (рекомендуется)
- Или: Supabase, Neon, Railway

**Получите строку подключения:**
```
postgresql://user:password@host:5432/database
```

### 2. Деплой на Timeweb (10 минут)

1. **Откройте** [Timeweb Cloud](https://timeweb.cloud/) → App Platform
2. **Создайте** новое приложение
3. **Подключите** ваш GitHub/GitLab репозиторий
4. **Выберите** ветку (main/master)
5. Timeweb автоматически обнаружит **Dockerfile**

### 3. Переменные окружения

Добавьте в Timeweb (раздел "Переменные окружения"):

```bash
# База данных
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT (сгенерируйте случайную строку 32+ символов)
JWT_SECRET=your-super-secret-jwt-key-change-this

# URL приложения (получите после создания)
NEXT_PUBLIC_APP_URL=https://your-app.timeweb.cloud

# Google OAuth
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret

# Email (для 2FA)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# OpenAI
OPENAI_API_KEY=sk-proj-your-key

# S3 Storage (Timeweb)
S3_ENDPOINT=https://s3.twcstorage.ru
S3_BUCKET_NAME=your-bucket
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_REGION=us-east-1

# Production
NODE_ENV=production
```

### 4. Запуск

1. Нажмите **"Создать приложение"**
2. Дождитесь завершения деплоя (5-10 минут)
3. Получите технический домен от Timeweb

### 5. Настройка Google OAuth

После получения домена:

1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. Перейдите в **APIs & Services → Credentials**
3. Добавьте redirect URI:
   ```
   https://your-app.timeweb.cloud/api/auth/google/callback
   ```

### 6. Обновите URL

В переменных окружения Timeweb обновите:
```
NEXT_PUBLIC_APP_URL=https://your-app.timeweb.cloud
```

## ✅ Готово!

Ваше приложение работает на Timeweb App Platform.

## Автоматические обновления

При каждом `git push` в вашу ветку Timeweb автоматически:
1. Подтянет новый код
2. Соберет Docker образ
3. Применит миграции БД
4. Запустит новую версию

## Проблемы?

### Если основной Dockerfile не работает:

1. Переименуйте файлы:
   ```bash
   mv Dockerfile Dockerfile.multi-stage
   mv Dockerfile.simple Dockerfile
   ```

2. Запустите повторный деплой в Timeweb

### Проверка логов:

В панели Timeweb → Ваше приложение → Логи

## 📚 Полная документация

- **DEPLOYMENT.md** - подробная инструкция
- **DEPLOYMENT_CHECKLIST.md** - чеклист для проверки

## Поддержка

- [Документация Timeweb](https://timeweb.cloud/docs/app-platform)
- [Техподдержка Timeweb](https://timeweb.cloud/support)
