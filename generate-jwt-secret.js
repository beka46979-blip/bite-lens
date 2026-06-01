#!/usr/bin/env node

/**
 * Генератор безопасного JWT_SECRET
 * 
 * Использование:
 *   node generate-jwt-secret.js
 */

const crypto = require('crypto');

// Генерируем случайную строку длиной 64 символа
const secret = crypto.randomBytes(64).toString('hex');

console.log('\n🔐 Сгенерирован безопасный JWT_SECRET:\n');
console.log(secret);
console.log('\n📋 Скопируйте эту строку и добавьте в переменные окружения Timeweb:');
console.log(`JWT_SECRET=${secret}`);
console.log('\n⚠️  ВАЖНО: Никогда не коммитьте этот секрет в Git!\n');
