import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
  console.log('🔍 Проверка доступных моделей Prisma...\n');
  
  console.log('Доступные модели:');
  console.log(Object.keys(prisma).filter(key => !key.startsWith('_') && !key.startsWith('$')));
  
  try {
    console.log('\n✅ Тестируем prisma.users...');
    const count = await prisma.users.count();
    console.log(`   Найдено пользователей: ${count}`);
  } catch (error) {
    console.log(`   ❌ Ошибка: ${error.message}`);
  }
  
  await prisma.$disconnect();
  await pool.end();
}

test();
