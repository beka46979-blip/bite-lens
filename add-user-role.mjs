import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';

// Загружаем переменные окружения
dotenv.config();

const prisma = new PrismaClient();

async function addUserRole() {
  try {
    console.log('🔧 Добавление роли пользователя в таблицу users...\n');

    // Читаем SQL файл
    const sql = fs.readFileSync('add-user-role.sql', 'utf8');

    // Выполняем SQL
    await prisma.$executeRawUnsafe(sql);

    console.log('✅ Роль пользователя успешно добавлена!');
    
    // Проверяем результат
    const users = await prisma.$queryRaw`
      SELECT id, email, role 
      FROM users 
      LIMIT 5
    `;

    if (users.length > 0) {
      console.log('\n📋 Примеры пользователей с ролями:');
      users.forEach((user, i) => {
        console.log(`   ${i + 1}. ${user.email} - ${user.role}`);
      });
    } else {
      console.log('\n📋 Пользователей пока нет в базе');
    }

    console.log('\n💡 Доступные роли:');
    console.log('   - USER (обычный пользователь)');
    console.log('   - PREMIUM_USER (премиум пользователь)');
    console.log('   - VIP (VIP пользователь)');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    
    if (error.code === 'P2010') {
      console.log('\n💡 Возможно, поле уже существует. Проверьте таблицу users.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

addUserRole();
