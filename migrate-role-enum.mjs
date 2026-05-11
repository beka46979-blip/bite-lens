import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const prisma = new PrismaClient();

async function migrateRoleEnum() {
  try {
    console.log('🔧 Миграция enum Role...\n');

    // Читаем SQL файл
    const sql = fs.readFileSync('migrate-to-role-enum.sql', 'utf8');

    // Выполняем миграцию
    console.log('⚙️  Выполнение SQL миграции...');
    await prisma.$executeRawUnsafe(sql);

    console.log('✅ Миграция успешно выполнена!\n');

    // Проверяем результат
    console.log('📊 Проверка структуры таблиц:');
    
    const usersRole = await prisma.$queryRaw`
      SELECT column_name, data_type, udt_name, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `;
    
    console.log('\n👥 Таблица users:');
    console.log(usersRole);

    const adminsRole = await prisma.$queryRaw`
      SELECT column_name, data_type, udt_name, column_default
      FROM information_schema.columns 
      WHERE table_name = 'admins' AND column_name = 'role'
    `;
    
    console.log('\n🔐 Таблица admins:');
    console.log(adminsRole);

    // Проверяем enum значения
    const enumValues = await prisma.$queryRaw`
      SELECT 
        t.typname as enum_name,
        e.enumlabel as enum_value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public' AND t.typname = 'Role'
      ORDER BY e.enumsortorder
    `;
    
    console.log('\n📋 Значения enum Role:');
    console.log(enumValues);

    console.log('\n✅ Миграция завершена успешно!');
    console.log('\n💡 Теперь выполните: npx prisma generate');

  } catch (error) {
    console.error('❌ Ошибка при миграции:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateRoleEnum();
