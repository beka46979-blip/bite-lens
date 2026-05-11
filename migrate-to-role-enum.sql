-- Миграция с UserRole на Role

-- 1. Создаём новый enum Role (если не существует)
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Изменяем тип колонки role в таблице users
-- Сначала удаляем default
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

-- Изменяем тип колонки
ALTER TABLE users 
ALTER COLUMN role TYPE "Role" 
USING (
    CASE 
        WHEN role::text = 'USER' THEN 'USER'::"Role"
        WHEN role::text = 'PREMIUM_USER' THEN 'USER'::"Role"
        WHEN role::text = 'VIP' THEN 'USER'::"Role"
        ELSE 'USER'::"Role"
    END
);

-- Возвращаем default
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER'::"Role";

-- 3. Изменяем тип колонки role в таблице admins (если существует)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admins' AND column_name = 'role'
    ) THEN
        -- Удаляем default
        ALTER TABLE admins ALTER COLUMN role DROP DEFAULT;
        
        -- Изменяем тип
        ALTER TABLE admins 
        ALTER COLUMN role TYPE "Role" 
        USING (
            CASE 
                WHEN role::text = 'SUPER_ADMIN' THEN 'ADMIN'::"Role"
                WHEN role::text = 'ADMIN' THEN 'ADMIN'::"Role"
                WHEN role::text = 'MODERATOR' THEN 'ADMIN'::"Role"
                ELSE 'ADMIN'::"Role"
            END
        );
        
        -- Возвращаем default
        ALTER TABLE admins ALTER COLUMN role SET DEFAULT 'ADMIN'::"Role";
    END IF;
END $$;

-- 4. Удаляем старые enum типы (если они больше не используются)
DO $$ 
BEGIN
    DROP TYPE IF EXISTS "UserRole" CASCADE;
    DROP TYPE IF EXISTS "AdminRole" CASCADE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop old enum types: %', SQLERRM;
END $$;

-- 5. Проверяем результат
SELECT 
    table_name,
    column_name, 
    data_type, 
    udt_name,
    column_default
FROM information_schema.columns 
WHERE (table_name = 'users' OR table_name = 'admins') 
  AND column_name = 'role';
