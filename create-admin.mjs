import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = process.argv[2] || 'admin@bitelens.com';
    const password = process.argv[3] || 'Admin123!';

    // Проверяем, существует ли пользователь с таким email
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.role === Role.ADMIN) {
        console.log(`❌ Админ с email ${email} уже существует`);
      } else {
        console.log(`⚠️  Пользователь с email ${email} существует, но не является админом`);
        console.log('💡 Обновляем роль на ADMIN...');
        
        const updatedUser = await prisma.users.update({
          where: { email },
          data: { role: Role.ADMIN },
        });
        
        console.log('✅ Пользователь успешно повышен до админа!');
        console.log('📧 Email:', updatedUser.email);
        console.log('👤 Роль:', updatedUser.role);
      }
      return;
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(password, 10);

    // Создаем админа (пользователя с ролью ADMIN)
    const admin = await prisma.users.create({
      data: {
        email,
        passwordHash,
        role: Role.ADMIN,
        onboardingCompleted: true, // Админам не нужен onboarding
      },
    });

    console.log('✅ Админ успешно создан!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Пароль:', password);
    console.log('👤 Роль:', admin.role);
    console.log('🆔 ID:', admin.id);
    console.log('\n⚠️  Сохраните эти данные в безопасном месте!');
    console.log('\n💡 Теперь настройте Telegram Bot:');
    console.log('   node setup-admin-settings.mjs');
  } catch (error) {
    console.error('❌ Ошибка при создании админа:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
