# Применение миграции вручную
$env:PGPASSWORD = "12345"
psql -U postgres -d bite-lens -h localhost -p 5432 -c "
ALTER TABLE users 
  ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS google_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS avatar TEXT;

ALTER TABLE users 
  ALTER COLUMN gender DROP NOT NULL,
  ALTER COLUMN birth_date DROP NOT NULL,
  ALTER COLUMN height_cm DROP NOT NULL,
  ALTER COLUMN weight_start DROP NOT NULL,
  ALTER COLUMN weight_goal DROP NOT NULL,
  ALTER COLUMN activity_level DROP NOT NULL,
  ALTER COLUMN daily_kcal_target DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_google_id_key ON users(google_id);

SELECT 'Migration applied successfully!' as result;
"
