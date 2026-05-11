# 🗄️ Руководство по миграции базы данных

## Предварительные требования

1. **PostgreSQL** должен быть установлен и запущен
2. **Node.js** версии 20 или выше
3. Все зависимости установлены: `npm install`

## Шаг 1: Настройка подключения к БД

Откройте файл `.env` и укажите правильные данные для подключения к PostgreSQL:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/bite_lens?schema=public"
```

### Примеры для разных окружений:

**Локальная разработка:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bite_lens?schema=public"
```

**Supabase:**
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

**Neon:**
```env
DATABASE_URL="postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require"
```

**Railway:**
```env
DATABASE_URL="postgresql://postgres:[password]@[host].railway.app:5432/railway"
```

## Шаг 2: Создание базы данных (если нужно)

Если база данных `bite_lens` еще не создана, создайте её:

```bash
# Подключитесь к PostgreSQL
psql -U postgres

# Создайте базу данных
CREATE DATABASE bite_lens;

# Выйдите
\q
```

## Шаг 3: Применение миграций

Выполните команду для применения всех миграций:

```bash
npm run db:migrate
```

Или напрямую через Prisma CLI:

```bash
npx prisma migrate deploy
```

## Шаг 4: Генерация Prisma Client

После успешной миграции сгенерируйте Prisma Client:

```bash
npm run db:generate
```

## Шаг 5: Проверка

Откройте Prisma Studio для просмотра базы данных:

```bash
npm run db:studio
```

## Доступные команды

```json
{
  "db:generate": "prisma generate",           // Генерация Prisma Client
  "db:push": "prisma db push",                // Синхронизация схемы без миграций
  "db:migrate": "prisma migrate deploy",      // Применение миграций (production)
  "db:migrate:dev": "prisma migrate dev",     // Создание и применение миграций (dev)
  "db:studio": "prisma studio"                // Открыть Prisma Studio
}
```

## Структура базы данных

После миграции будут созданы следующие таблицы:

### Основные таблицы:
- `users` - пользователи приложения
- `professions` + `profession_translates` - профессии с переводами
- `user_goals` - цели пользователей по весу
- `subscriptions` - подписки (FREE/PRO/PREMIUM)
- `sessions` - сессии пользователей

### Питание:
- `meals` - приемы пищи
- `food_snaps` - фото еды с AI-анализом
- `foods` - справочник продуктов
- `daily_nutrition_summary` - дневная сводка

### Прогресс:
- `weight_logs` - логи веса
- `streaks` - серии последовательных дней
- `achievements` + `user_achievements` - достижения

### Система:
- `ai_logs` - логи AI запросов
- `food_snap_feedback` - обратная связь
- `notifications` - уведомления
- `user_activity_logs` - логи активности
- `admins` - администраторы
- `settings` - настройки системы

## Troubleshooting

### Ошибка: "Authentication failed"
- Проверьте правильность username и password в DATABASE_URL
- Убедитесь, что PostgreSQL запущен

### Ошибка: "database does not exist"
- Создайте базу данных вручную (см. Шаг 2)

### Ошибка: "The datasource.url property is required"
- Убедитесь, что файл `.env` существует
- Проверьте, что переменная DATABASE_URL установлена
- Файл `prisma.config.ts` должен быть в корне проекта

## Разработка

Для разработки используйте:

```bash
# Создание новой миграции
npx prisma migrate dev --name your_migration_name

# Сброс базы данных (ОСТОРОЖНО!)
npx prisma migrate reset
```

## Production

Для production окружения:

```bash
# Применение миграций
npx prisma migrate deploy

# Генерация клиента
npx prisma generate
```

---

**Важно:** Никогда не коммитьте файл `.env` с реальными учетными данными в Git!
