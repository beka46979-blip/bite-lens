import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  console.log('🔄 Миграция plan_type с enum на varchar...\n');

  try {
    // 1. Изменяем тип в subscription_plans
    console.log('1️⃣ Изменение типа в subscription_plans...');
    await pool.query(`
      ALTER TABLE subscription_plans 
      ALTER COLUMN plan_type TYPE VARCHAR(50);
    `);
    console.log('   ✅ Готово\n');

    // 2. Изменяем тип в subscriptions
    console.log('2️⃣ Изменение типа в subscriptions...');
    await pool.query(`
      ALTER TABLE subscriptions 
      ALTER COLUMN plan_type TYPE VARCHAR(50);
    `);
    console.log('   ✅ Готово\n');

    console.log('✅ Миграция завершена успешно!');
    console.log('📝 Теперь можно использовать любые значения для plan_type\n');

  } catch (error) {
    console.error('❌ Ошибка миграции:', error.message);
  } finally {
    await pool.end();
  }
}

migrate();
