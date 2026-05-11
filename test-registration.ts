// Тестовый скрипт для проверки регистрации
// Запуск: npx tsx test-registration.ts

import { prisma } from './lib/prisma';
import { hashPassword } from './lib/auth/password';

async function testRegistration() {
  try {
    console.log('🔍 Проверка подключения к БД...');
    
    // Проверка подключения
    await prisma.$connect();
    console.log('✅ Подключение к БД успешно');

    // Проверка структуры таблицы
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `;
    console.log('\n📋 Структура таблицы users:');
    console.log(tableInfo);

    // Тест создания пользователя
    const testEmail = `test_${Date.now()}@example.com`;
    console.log(`\n🧪 Тестирование создания пользователя: ${testEmail}`);

    const passwordHash = await hashPassword('testpassword123');
    
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash,
        onboardingCompleted: false,
      },
    });

    console.log('✅ Пользователь создан успешно:');
    console.log({
      id: user.id,
      email: user.email,
      onboardingCompleted: user.onboardingCompleted,
      createdAt: user.createdAt,
    });

    // Удаление тестового пользователя
    await prisma.user.delete({
      where: { id: user.id },
    });
    console.log('🗑️  Тестовый пользователь удален');

    console.log('\n✅ Все тесты пройдены успешно!');
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testRegistration();
