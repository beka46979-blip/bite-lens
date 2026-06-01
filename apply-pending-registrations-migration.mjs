import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

// Создаем connection pool
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL не найден в .env файле');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ 
  adapter,
  log: ['error', 'warn'],
});

async function main() {
  try {
    console.log('📦 Применение миграции для pending_registrations...');
    
    const sql = fs.readFileSync('./create-pending-registrations.sql', 'utf-8');
    
    await prisma.$executeRawUnsafe(sql);
    
    console.log('✅ Миграция успешно применена!');
    console.log('📋 Таблица pending_registrations создана');
  } catch (error) {
    console.error('❌ Ошибка при применении миграции:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
