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

async function clearTestUsers() {
  console.log('\n🧹 Очистка тестовых пользователей и pending регистраций\n');
  console.log('='.repeat(60));
  
  try {
    // Список email для удаления
    const testEmails = [
      'clooh374@gmail.com',
      'vvvuuu087@gmail.com',
      'test@example.com',
      'test123@example.com',
      // Добавьте сюда другие тестовые email
    ];
    
    console.log('\n📋 Email для удаления:');
    testEmails.forEach(email => console.log(`   - ${email}`));
    
    // Удаляем pending регистрации
    console.log('\n1️⃣ Удаление pending регистраций...');
    const deletedPending = await prisma.pending_registrations.deleteMany({
      where: {
        email: {
          in: testEmails
        }
      }
    });
    console.log(`✅ Удалено pending регистраций: ${deletedPending.count}`);
    
    // Удаляем пользователей
    console.log('\n2️⃣ Удаление пользователей...');
    const deletedUsers = await prisma.users.deleteMany({
      where: {
        email: {
          in: testEmails
        }
      }
    });
    console.log(`✅ Удалено пользователей: ${deletedUsers.count}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ОЧИСТКА ЗАВЕРШЕНА!');
    console.log('='.repeat(60));
    console.log('\n💡 Теперь вы можете зарегистрироваться с этими email снова\n');
    
  } catch (error) {
    console.error('\n❌ ОШИБКА:', error.message);
    console.error('\nДетали:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

clearTestUsers();
