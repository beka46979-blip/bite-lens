-- Добавление роли пользователя в таблицу users

-- 1. Создаем enum для ролей пользователей
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('USER', 'PREMIUM_USER', 'VIP');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Добавляем поле role в таблицу users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role "UserRole" DEFAULT 'USER' NOT NULL;

-- 3. Обновляем существующих пользователей (если есть)
UPDATE users SET role = 'USER' WHERE role IS NULL;

-- 4. Проверяем результат
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';
