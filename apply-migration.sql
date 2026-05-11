-- Применение миграции для поддержки OAuth
-- Выполните этот файл в вашей БД если миграция не применилась автоматически

-- Проверка текущей структуры
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Применение изменений
ALTER TABLE "users" 
  ALTER COLUMN "password_hash" DROP NOT NULL;

ALTER TABLE "users" 
  ADD COLUMN IF NOT EXISTS "google_id" VARCHAR(255);

ALTER TABLE "users" 
  ADD COLUMN IF NOT EXISTS "name" VARCHAR(255);

ALTER TABLE "users" 
  ADD COLUMN IF NOT EXISTS "avatar" TEXT;

ALTER TABLE "users" 
  ALTER COLUMN "gender" DROP NOT NULL;

ALTER TABLE "users" 
  ALTER COLUMN "birth_date" DROP NOT NULL;

ALTER TABLE "users" 
  ALTER COLUMN "height_cm" DROP NOT NULL;

ALTER TABLE "users" 
  ALTER COLUMN "weight_start" DROP NOT NULL;

ALTER TABLE "users" 
  ALTER COLUMN "weight_goal" DROP NOT NULL;

ALTER TABLE "users" 
  ALTER COLUMN "activity_level" DROP NOT NULL;

ALTER TABLE "users" 
  ALTER COLUMN "daily_kcal_target" DROP NOT NULL;

-- Создание индекса для google_id
CREATE UNIQUE INDEX IF NOT EXISTS "users_google_id_key" ON "users"("google_id");

-- Проверка результата
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
