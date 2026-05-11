-- Переименование enum UserRole в Role

-- 1. Переименовываем enum
ALTER TYPE "UserRole" RENAME TO "Role";

-- 2. Обновляем значения enum (удаляем старые, оставляем только ADMIN и USER)
-- Сначала создаем временный enum
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'USER');

-- 3. Обновляем колонку role в таблице users
-- Преобразуем все значения в USER (так как у нас теперь только ADMIN и USER)
ALTER TABLE users 
  ALTER COLUMN role TYPE "Role_new" 
  USING (
    CASE 
      WHEN role::text = 'USER' THEN 'USER'::"Role_new"
      WHEN role::text = 'PREMIUM_USER' THEN 'USER'::"Role_new"
      WHEN role::text = 'VIP' THEN 'USER'::"Role_new"
      ELSE 'USER'::"Role_new"
    END
  );

-- 4. Удаляем старый enum
DROP TYPE "Role";

-- 5. Переименовываем новый enum
ALTER TYPE "Role_new" RENAME TO "Role";

-- Проверяем результат
SELECT column_name, data_type, udt_name
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';
