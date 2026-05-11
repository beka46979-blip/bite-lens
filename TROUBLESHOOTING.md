# 🔧 Troubleshooting Database Connection

## Ошибка: "Authentication failed against database server"

Эта ошибка означает, что Prisma не может подключиться к PostgreSQL. Вот как это исправить:

---

## Шаг 1: Проверьте, запущен ли PostgreSQL

### Windows:

#### Вариант A: Через Services (Службы)
1. Нажмите `Win + R`
2. Введите `services.msc` и нажмите Enter
3. Найдите службу `postgresql-x64-XX` (где XX - версия)
4. Убедитесь, что статус "Выполняется" (Running)
5. Если нет - щелкните правой кнопкой → "Запустить"

#### Вариант B: Через PowerShell (от администратора)
```powershell
Get-Service -Name postgresql*
```

Если служба остановлена:
```powershell
Start-Service -Name "postgresql-x64-XX"  # замените XX на вашу версию
```

---

## Шаг 2: Найдите правильный пароль PostgreSQL

Пароль был установлен при установке PostgreSQL. Если вы его забыли:

### Вариант A: Проверьте сохраненные пароли
Проверьте файл `%APPDATA%\postgresql\pgpass.conf` (если существует)

### Вариант B: Сбросьте пароль

1. Найдите файл `pg_hba.conf`:
   - Обычно в `C:\Program Files\PostgreSQL\XX\data\pg_hba.conf`
   
2. Откройте его от имени администратора

3. Найдите строку:
   ```
   host    all             all             127.0.0.1/32            scram-sha-256
   ```

4. Временно замените на:
   ```
   host    all             all             127.0.0.1/32            trust
   ```

5. Перезапустите PostgreSQL:
   ```powershell
   Restart-Service -Name "postgresql-x64-XX"
   ```

6. Подключитесь без пароля и смените его:
   ```powershell
   # Найдите путь к psql.exe
   cd "C:\Program Files\PostgreSQL\XX\bin"
   
   # Подключитесь
   .\psql.exe -U postgres
   
   # Смените пароль
   ALTER USER postgres PASSWORD 'новый_пароль';
   
   # Выйдите
   \q
   ```

7. Верните `pg_hba.conf` обратно (замените `trust` на `scram-sha-256`)

8. Перезапустите PostgreSQL снова

---

## Шаг 3: Обновите .env файл

После того как узнаете правильный пароль, обновите `.env`:

```env
DATABASE_URL="postgresql://postgres:ВАШ_ПАРОЛЬ@localhost:5432/bite_lens?schema=public"
```

**Важно:** Замените `ВАШ_ПАРОЛЬ` на реальный пароль!

---

## Шаг 4: Создайте базу данных

### Вариант A: Через psql
```powershell
cd "C:\Program Files\PostgreSQL\XX\bin"
.\psql.exe -U postgres

# В psql:
CREATE DATABASE bite_lens;
\q
```

### Вариант B: Через pgAdmin
1. Откройте pgAdmin
2. Подключитесь к серверу PostgreSQL
3. Правый клик на "Databases" → "Create" → "Database"
4. Имя: `bite_lens`
5. Нажмите "Save"

### Вариант C: Автоматически через Prisma
Prisma может создать базу данных автоматически при первой миграции, если у пользователя есть права.

---

## Шаг 5: Проверьте подключение

Попробуйте подключиться через Prisma:

```powershell
npx prisma db pull
```

Если команда выполнилась без ошибок - подключение работает!

---

## Шаг 6: Примените миграции

Теперь можно применить миграции:

```powershell
npm run db:migrate
```

Или:

```powershell
npx prisma migrate deploy
```

---

## Альтернатива: Использование облачной БД

Если локальная установка PostgreSQL вызывает проблемы, используйте бесплатную облачную БД:

### 🌐 Supabase (Рекомендуется)

1. Зарегистрируйтесь на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Скопируйте Connection String из Settings → Database
4. Обновите `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

### 🌐 Neon

1. Зарегистрируйтесь на [neon.tech](https://neon.tech)
2. Создайте новый проект
3. Скопируйте Connection String
4. Обновите `.env`:
   ```env
   DATABASE_URL="postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require"
   ```

### 🌐 Railway

1. Зарегистрируйтесь на [railway.app](https://railway.app)
2. Создайте новый PostgreSQL сервис
3. Скопируйте DATABASE_URL из переменных окружения
4. Обновите `.env`

---

## Частые ошибки

### "database does not exist"
✅ **Решение:** Создайте базу данных (см. Шаг 4)

### "role 'postgres' does not exist"
✅ **Решение:** Используйте другое имя пользователя или создайте пользователя `postgres`

### "connection refused"
✅ **Решение:** PostgreSQL не запущен (см. Шаг 1)

### "timeout"
✅ **Решение:** Проверьте firewall или используйте `127.0.0.1` вместо `localhost`

---

## Проверка установки PostgreSQL

Если PostgreSQL не установлен:

### Windows:
1. Скачайте с [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Запустите установщик
3. Запомните пароль, который вы установите для пользователя `postgres`!
4. Установите порт `5432` (по умолчанию)

### Через Docker (альтернатива):
```powershell
docker run --name postgres-bite-lens -e POSTGRES_PASSWORD=12345 -e POSTGRES_DB=bite_lens -p 5432:5432 -d postgres:16
```

Затем в `.env`:
```env
DATABASE_URL="postgresql://postgres:12345@localhost:5432/bite_lens?schema=public"
```

---

## Нужна помощь?

Если проблема не решена:

1. Проверьте логи PostgreSQL:
   - Windows: `C:\Program Files\PostgreSQL\XX\data\log\`

2. Попробуйте подключиться через другой клиент (pgAdmin, DBeaver)

3. Убедитесь, что порт 5432 не занят другим приложением:
   ```powershell
   netstat -ano | findstr :5432
   ```

4. Используйте облачную БД (Supabase/Neon) как временное решение
