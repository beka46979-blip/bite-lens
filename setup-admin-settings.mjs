import { PrismaClient } from '@prisma/client';
import readline from 'readline';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function setupAdminSettings() {
  try {
    console.log('🔧 Настройка Telegram для админ-панели\n');

    // Проверяем существующие настройки
    const existingSettings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['ADMIN_TELEGRAM_BOT_TOKEN', 'ADMIN_TELEGRAM_USER_ID'],
        },
      },
    });

    const existingBotToken = existingSettings.find(s => s.key === 'ADMIN_TELEGRAM_BOT_TOKEN');
    const existingUserId = existingSettings.find(s => s.key === 'ADMIN_TELEGRAM_USER_ID');

    if (existingBotToken || existingUserId) {
      console.log('⚠️  Найдены существующие настройки:');
      if (existingBotToken) {
        console.log(`   Bot Token: ${existingBotToken.value.substring(0, 20)}...`);
      }
      if (existingUserId) {
        console.log(`   User ID: ${existingUserId.value}`);
      }
      console.log('');

      const overwrite = await question('Перезаписать настройки? (y/n): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('❌ Отменено');
        rl.close();
        return;
      }
    }

    console.log('\n📝 Инструкция:');
    console.log('1. Создайте бота через @BotFather в Telegram');
    console.log('2. Получите Bot Token (например: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz)');
    console.log('3. Узнайте свой User ID через @userinfobot\n');

    const botToken = await question('Введите Bot Token: ');
    const userId = await question('Введите ваш Telegram User ID: ');

    if (!botToken || !userId) {
      console.log('❌ Bot Token и User ID обязательны');
      rl.close();
      return;
    }

    // Удаляем старые настройки
    if (existingBotToken) {
      await prisma.setting.delete({ where: { id: existingBotToken.id } });
    }
    if (existingUserId) {
      await prisma.setting.delete({ where: { id: existingUserId.id } });
    }

    // Создаем новые настройки
    await prisma.setting.createMany({
      data: [
        {
          key: 'ADMIN_TELEGRAM_BOT_TOKEN',
          value: botToken.trim(),
        },
        {
          key: 'ADMIN_TELEGRAM_USER_ID',
          value: userId.trim(),
        },
      ],
    });

    console.log('\n✅ Настройки успешно сохранены!');
    console.log('🤖 Bot Token:', botToken.substring(0, 20) + '...');
    console.log('👤 User ID:', userId);
    console.log('\n📱 Не забудьте отправить /start вашему боту в Telegram!');
    console.log('\n🔐 Теперь создайте админа с помощью:');
    console.log('   node create-admin.mjs\n');
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

setupAdminSettings();
