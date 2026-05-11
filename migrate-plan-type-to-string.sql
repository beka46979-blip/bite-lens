-- Миграция: изменение plan_type с enum на varchar

-- 1. Изменяем тип plan_type в subscription_plans на varchar
ALTER TABLE subscription_plans 
ALTER COLUMN plan_type TYPE VARCHAR(50);

-- 2. Изменяем тип plan_type в subscriptions на varchar
ALTER TABLE subscriptions 
ALTER COLUMN plan_type TYPE VARCHAR(50);

-- 3. Удаляем старый enum PlanType (если он больше не используется)
-- DROP TYPE IF EXISTS "PlanType";

-- Готово! Теперь можно использовать любые значения для plan_type
