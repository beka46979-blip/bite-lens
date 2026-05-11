import { PrismaClient, Role } from '@prisma/client';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

const prisma = new PrismaClient();

async function testAdminSystem() {
  console.log('🧪 Проверка админ-системы...\n');

  try {
    // 1. Проверяем админов в таблице users
    console.log('1️⃣ Проверка админов в таблице users...');
    const adminsCount = await prisma.users.count({
      where: { role: Role.ADMIN },
    });
    console.log(`   ✅ Найдено админов: ${adminsCount}`);

    if (adminsCount > 0) {
      const admins = await prisma.users.findMany({
        where: { role: Role.ADMIN },
        select: { email: true, role: true, createdAt: true },
      });
      console.log('   📋 Список админов:');
      admins.forEach((admin, i) => {
        console.log(`      ${i + 1}. ${admin.email} (${admin.role})`);
      });
    } else {
      console.log('   ⚠️  Админы не найдены. Создайте админа: node create-admin.mjs');
    }

    // 2. Проверяем обычных пользователей
    console.log('\n2️⃣ Проверка обычных пользователей...');
    const usersCount = await prisma.users.count({
      where: { role: Role.USER },
    });
    console.log(`   ✅ Найдено пользователей: ${usersCount}`);

    // 3. Проверяем настройки Telegram
    console.log('\n3️⃣ Проверка настроек Telegram...');
    const telegramSettings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['ADMIN_TELEGRAM_BOT_TOKEN', 'ADMIN_TELEGRAM_USER_ID'],
        },
      },
    });

    const botToken = telegramSettings.find(s => s.key === 'ADMIN_TELEGRAM_BOT_TOKEN');
    const userId = telegramSettings.find(s => s.key === 'ADMIN_TELEGRAM_USER_ID');

    if (botToken && userId) {
      console.log('   ✅ Bot Token:', botToken.value.substring(0, 20) + '...');
      console.log('   ✅ User ID:', userId.value);

      if (botToken.value === 'YOUR_BOT_TOKEN' || userId.value === 'YOUR_TELEGRAM_USER_ID') {
        console.log('   ⚠️  Настройки не обновлены. Обновите их в базе данных');
      }
    } else {
      console.log('   ❌ Настройки Telegram не найдены');
      console.log('   💡 Добавьте настройки в таблицу settings:');
      console.log('      INSERT INTO settings (id, key, value) VALUES');
      console.log("        (gen_random_uuid(), 'ADMIN_TELEGRAM_BOT_TOKEN', 'YOUR_BOT_TOKEN'),");
      console.log("        (gen_random_uuid(), 'ADMIN_TELEGRAM_USER_ID', 'YOUR_TELEGRAM_USER_ID');");
    }

    // 4. Проверяем таблицу settings
    console.log('\n4️⃣ Проверка таблицы settings...');
    const settingsCount = await prisma.setting.count();
    console.log(`   ✅ Всего настроек: ${settingsCount}`);

    // 5. Итоговый статус
    console.log('\n📊 Итоговый статус:');
    const isReady = adminsCount > 0 && botToken && userId && 
                    botToken.value !== 'YOUR_BOT_TOKEN' && 
                    userId.value !== 'YOUR_TELEGRAM_USER_ID';

    if (isReady) {
      console.log('   ✅ Админ-система готова к использованию!');
      console.log('   🌐 Откройте: http://localhost:3000/admin/login');
    } else {
      console.log('   ⚠️  Требуется настройка:');
      if (adminsCount === 0) {
        console.log('      - Создайте админа: node create-admin.mjs admin@example.com password123');
      }
      if (!botToken || !userId || botToken.value === 'YOUR_BOT_TOKEN') {
        console.log('      - Настройте Telegram в таблице settings');
      }
    }

    console.log('');
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    
    if (error.code === 'P2021') {
      console.log('\n💡 Таблица не существует. Выполните синхронизацию:');
      console.log('   npx prisma db push');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testAdminSystem();
