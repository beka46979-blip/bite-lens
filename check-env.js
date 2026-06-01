#!/usr/bin/env node

/**
 * Проверка наличия всех необходимых переменных окружения
 * 
 * Использование:
 *   node check-env.js
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NEXT_PUBLIC_APP_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'OPENAI_API_KEY',
  'S3_ENDPOINT',
  'S3_BUCKET_NAME',
  'S3_ACCESS_KEY',
  'S3_SECRET_KEY',
  'S3_REGION',
];

const optionalEnvVars = [
  'NODE_ENV',
  'PORT',
];

console.log('🔍 Проверка переменных окружения...\n');

let hasErrors = false;
const missing = [];
const present = [];

// Проверяем обязательные переменные
requiredEnvVars.forEach((varName) => {
  if (process.env[varName]) {
    present.push(varName);
    console.log(`✅ ${varName}`);
  } else {
    missing.push(varName);
    hasErrors = true;
    console.log(`❌ ${varName} - ОТСУТСТВУЕТ`);
  }
});

console.log('\n📋 Опциональные переменные:\n');

// Проверяем опциональные переменные
optionalEnvVars.forEach((varName) => {
  if (process.env[varName]) {
    console.log(`✅ ${varName} = ${process.env[varName]}`);
  } else {
    console.log(`⚠️  ${varName} - не установлена (будет использовано значение по умолчанию)`);
  }
});

console.log('\n' + '='.repeat(60));

if (hasErrors) {
  console.log('\n❌ ОШИБКА: Отсутствуют обязательные переменные окружения!\n');
  console.log('Отсутствующие переменные:');
  missing.forEach((varName) => {
    console.log(`  - ${varName}`);
  });
  console.log('\nДобавьте их в файл .env или в настройки Timeweb App Platform.');
  process.exit(1);
} else {
  console.log('\n✅ Все обязательные переменные окружения установлены!');
  console.log(`\nВсего проверено: ${requiredEnvVars.length} обязательных переменных`);
  console.log(`Установлено: ${present.length}/${requiredEnvVars.length}\n`);
}
