// Скрипт для перезагрузки .env без перезапуска сервера
import { config } from 'dotenv';
import { resolve } from 'path';

console.log('🔄 Перезагрузка .env файла...');

// Очищаем кеш
delete process.env.GOOGLE_CLIENT_SECRET;
delete process.env.GOOGLE_CLIENT_ID;

// Загружаем заново
config({ path: resolve('.env'), override: true });

console.log('✅ .env перезагружен!');
console.log('📋 Текущие значения:');
console.log('   GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...');
console.log('   GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET?.substring(0, 15) + '...');
console.log('\n⚠️  Примечание: Next.js dev сервер нужно перезапустить для применения изменений');
