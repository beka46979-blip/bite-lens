-- AlterTable
ALTER TABLE "users" 
  ALTER COLUMN "password_hash" DROP NOT NULL,
  ADD COLUMN "google_id" VARCHAR(255),
  ADD COLUMN "name" VARCHAR(255),
  ADD COLUMN "avatar" TEXT,
  ALTER COLUMN "gender" DROP NOT NULL,
  ALTER COLUMN "birth_date" DROP NOT NULL,
  ALTER COLUMN "height_cm" DROP NOT NULL,
  ALTER COLUMN "weight_start" DROP NOT NULL,
  ALTER COLUMN "weight_goal" DROP NOT NULL,
  ALTER COLUMN "activity_level" DROP NOT NULL,
  ALTER COLUMN "daily_kcal_target" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");
