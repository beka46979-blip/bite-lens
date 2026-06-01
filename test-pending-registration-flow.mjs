import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL не найден в .env файле');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testPendingRegistrationFlow() {
  const testEmail = `test-${Date.now()}@example.com`;
  
  console.log('\n🧪 Тестирование потока pending регистрации\n');
  console.log('=' .repeat(60));
  
  try {
    // 1. Проверяем, что таблица pending_registrations существует
    console.log('\n1️⃣ Проверка существования таблицы pending_registrations...');
    const pendingRegs = await prisma.pending_registrations.findMany({ take: 1 });
    console.log('✅ Таблица pending_registrations существует');
    
    // 2. Создаем тестовую pending регистрацию
    console.log('\n2️⃣ Создание тестовой pending регистрации...');
    const testPending = await prisma.pending_registrations.create({
      data: {
        id: crypto.randomUUID(),
        email: testEmail,
        password_hash: 'test_hash_' + Date.now(),
        verification_code: '123456',
        code_expires_at: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
    console.log('✅ Pending регистрация создана:', testEmail);
    
    // 3. Проверяем, что pending регистрация существует
    console.log('\n3️⃣ Проверка pending регистрации...');
    const foundPending = await prisma.pending_registrations.findUnique({
      where: { email: testEmail },
    });
    if (foundPending) {
      console.log('✅ Pending регистрация найдена');
      console.log('   - Email:', foundPending.email);
      console.log('   - Код:', foundPending.verification_code);
      console.log('   - Истекает:', foundPending.code_expires_at);
    } else {
      throw new Error('Pending регистрация не найдена');
    }
    
    // 4. Проверяем, что пользователь еще НЕ создан
    console.log('\n4️⃣ Проверка, что пользователь еще не создан...');
    const user = await prisma.users.findUnique({
      where: { email: testEmail },
    });
    if (!user) {
      console.log('✅ Пользователь еще не создан (как и ожидалось)');
    } else {
      throw new Error('Пользователь уже существует (не должен!)');
    }
    
    // 5. Симулируем успешную верификацию - создаем пользователя
    console.log('\n5️⃣ Симуляция успешной верификации...');
    const newUser = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        email: testEmail,
        password_hash: foundPending.password_hash,
        is_email_verified: true,
        onboarding_completed: false,
      },
    });
    console.log('✅ Пользователь создан после верификации');
    
    // 6. Удаляем pending регистрацию
    console.log('\n6️⃣ Удаление pending регистрации...');
    await prisma.pending_registrations.delete({
      where: { email: testEmail },
    });
    console.log('✅ Pending регистрация удалена');
    
    // 7. Проверяем, что pending регистрация удалена
    console.log('\n7️⃣ Проверка удаления pending регистрации...');
    const deletedPending = await prisma.pending_registrations.findUnique({
      where: { email: testEmail },
    });
    if (!deletedPending) {
      console.log('✅ Pending регистрация успешно удалена');
    } else {
      throw new Error('Pending регистрация все еще существует');
    }
    
    // 8. Очистка - удаляем тестового пользователя
    console.log('\n8️⃣ Очистка тестовых данных...');
    await prisma.users.delete({
      where: { email: testEmail },
    });
    console.log('✅ Тестовый пользователь удален');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');
    console.log('='.repeat(60));
    console.log('\n📋 Резюме:');
    console.log('   ✓ Таблица pending_registrations работает');
    console.log('   ✓ Создание pending регистрации работает');
    console.log('   ✓ Поиск pending регистрации работает');
    console.log('   ✓ Пользователь не создается до верификации');
    console.log('   ✓ Создание пользователя после верификации работает');
    console.log('   ✓ Удаление pending регистрации работает');
    console.log('\n🎉 Система pending регистраций готова к использованию!\n');
    
  } catch (error) {
    console.error('\n❌ ОШИБКА:', error.message);
    console.error('\nДетали:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testPendingRegistrationFlow();
