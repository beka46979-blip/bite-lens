# Инструкция по деплою на Timeweb App Platform

## Подготовка проекта

### 1. Убедитесь, что файлы готовы
- ✅ `Dockerfile` создан
- ✅ `.dockerignore` создан
- ✅ `.env` НЕ добавлен в Git (должен быть в `.gitignore`)

### 2. Проверьте `.gitignore`
Убедитесь, что `.env` файл не попадет в репозиторий:
```
.env
.env.local
.env.production
```

## Настройка внешней базы данных

Перед деплоем создайте PostgreSQL базу данных. Рекомендуемые варианты:
- **Timeweb Cloud Database** (рекомендуется для лучшей производительности)
- Supabase
- Neon
- Railway
- AWS RDS

Сохраните строку подключения в формате:
```
postgresql://username:password@host:5432/database_name
```

## Деплой на Timeweb App Platform

### Шаг 1: Подключите репозиторий
1. Войдите в панель Timeweb Cloud
2. Перейдите в раздел **App Platform**
3. Нажмите **"Создать приложение"**
4. Выберите источник:
   - GitHub / GitLab / Bitbucket (рекомендуется)
   - Или укажите публичную ссылку на репозиторий

### Шаг 2: Настройте параметры приложения
1. **Тип приложения**: Backend (Node.js)
2. **Ветка**: main или master
3. **Dockerfile**: Timeweb автоматически обнаружит Dockerfile в корне проекта

### Шаг 3: Настройте переменные окружения
В разделе **"Переменные окружения"** добавьте все необходимые переменные:

#### Обязательные переменные:
```bash
# База данных (используйте вашу внешнюю БД)
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT Secret (сгенерируйте случайную строку)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# URL приложения (будет предоставлен Timeweb после создания)
NEXT_PUBLIC_APP_URL=https://your-app.timeweb.cloud

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# SMTP для email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# OpenAI API
OPENAI_API_KEY=sk-proj-your-openai-api-key

# S3 Storage (Timeweb Cloud Storage)
S3_ENDPOINT=https://s3.twcstorage.ru
S3_BUCKET_NAME=your-bucket-name
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_REGION=us-east-1

# Production режим
NODE_ENV=production
```

### Шаг 4: Настройте автодеплой
- ✅ Включите **"Автоматический деплой"** для автоматического обновления при git push
- Выберите ветку для отслеживания (обычно `main`)

### Шаг 5: Запустите деплой
1. Нажмите **"Создать приложение"**
2. Timeweb начнет процесс:
   - Клонирование репозитория
   - Установка зависимостей из `package.json`
   - Сборка Docker образа
   - Запуск контейнера
   - Настройка Nginx и SSL

### Шаг 6: Проверьте деплой
После успешного деплоя:
1. Получите технический домен (например: `your-app.timeweb.cloud`)
2. Проверьте работу приложения
3. Проверьте логи в панели Timeweb

## Настройка Google OAuth

После получения домена обновите Google OAuth настройки:

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите ваш проект
3. Перейдите в **APIs & Services > Credentials**
4. Добавьте в **Authorized redirect URIs**:
   ```
   https://your-app.timeweb.cloud/api/auth/google/callback
   ```

## Настройка S3 Storage (Timeweb Cloud Storage)

1. Создайте бакет в Timeweb Cloud Storage
2. Получите Access Key и Secret Key
3. Настройте CORS для бакета (если нужно загружать файлы с фронтенда)

## Миграции базы данных

Миграции выполняются автоматически при каждом деплое благодаря команде в Dockerfile:
```bash
npx prisma migrate deploy
```

Это применит все pending миграции к вашей базе данных.

## Мониторинг и логи

### Просмотр логов:
1. В панели Timeweb перейдите в ваше приложение
2. Откройте вкладку **"Логи"**
3. Отслеживайте ошибки и предупреждения

### Проверка здоровья приложения:
- Проверьте доступность: `https://your-app.timeweb.cloud`
- Проверьте API: `https://your-app.timeweb.cloud/api/health` (если есть)

## Обновление приложения

### Автоматическое обновление (рекомендуется):
1. Сделайте изменения в коде
2. Закоммитьте и запушьте в Git:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```
3. Timeweb автоматически запустит новый деплой

### Ручное обновление:
1. В панели Timeweb перейдите в приложение
2. Нажмите **"Пересобрать"** или **"Redeploy"**

## Масштабирование

В настройках приложения можно:
- Увеличить количество CPU и RAM
- Настроить автомасштабирование
- Добавить несколько инстансов

## Привязка собственного домена

1. В панели Timeweb перейдите в настройки приложения
2. Добавьте свой домен
3. Настройте DNS записи у вашего регистратора:
   - Добавьте CNAME запись, указывающую на технический домен Timeweb
4. SSL-сертификат Let's Encrypt будет выпущен автоматически

## Troubleshooting

### Приложение не запускается:
1. Проверьте логи в панели Timeweb
2. Убедитесь, что все переменные окружения установлены
3. Проверьте подключение к базе данных

### Ошибки миграций:
1. Проверьте `DATABASE_URL`
2. Убедитесь, что база данных доступна из Timeweb
3. Проверьте логи миграций

### Ошибки сборки:
1. Проверьте `package.json` на корректность
2. Убедитесь, что все зависимости установлены
3. Проверьте Dockerfile на ошибки

## Полезные команды

### Локальная проверка Docker образа:
```bash
# Сборка образа
docker build -t bite-lens .

# Запуск контейнера
docker run -p 3000:3000 --env-file .env bite-lens
```

### Проверка Prisma:
```bash
# Генерация клиента
npm run db:generate

# Применение миграций
npm run db:migrate
```

## Безопасность

- ✅ Никогда не коммитьте `.env` файл
- ✅ Используйте сильные пароли для базы данных
- ✅ Регулярно обновляйте зависимости
- ✅ Используйте HTTPS (автоматически в Timeweb)
- ✅ Храните секреты только в переменных окружения Timeweb

## Поддержка

- [Документация Timeweb App Platform](https://timeweb.cloud/docs/app-platform)
- [Документация Next.js](https://nextjs.org/docs)
- [Документация Prisma](https://www.prisma.io/docs)
