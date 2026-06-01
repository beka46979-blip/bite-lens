/**
 * Тест валидации пароля с требованием букв
 */

// Функция валидации (копия из password-validation.ts)
function validatePassword(password) {
  const requirements = {
    minLength: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  if (!requirements.minLength) {
    return { valid: false, error: 'Пароль должен содержать минимум 8 символов', requirements };
  }
  
  if (!requirements.hasLetter) {
    return { valid: false, error: 'Пароль должен содержать хотя бы одну букву', requirements };
  }
  
  if (!requirements.hasNumber) {
    return { valid: false, error: 'Пароль должен содержать хотя бы одну цифру', requirements };
  }
  
  if (!requirements.hasSpecialChar) {
    return { valid: false, error: 'Пароль должен содержать хотя бы один специальный символ', requirements };
  }
  
  return { valid: true, requirements };
}

console.log('\n🧪 Тестирование валидации пароля с требованием букв\n');
console.log('='.repeat(70));

const testCases = [
  // Невалидные пароли
  { password: '12345678', expected: false, reason: 'Только цифры (нет букв и спецсимволов)' },
  { password: '!@#$%^&*', expected: false, reason: 'Только спецсимволы (нет букв и цифр)' },
  { password: 'abcdefgh', expected: false, reason: 'Только буквы (нет цифр и спецсимволов)' },
  { password: 'abc123', expected: false, reason: 'Меньше 8 символов' },
  { password: 'abc12345', expected: false, reason: 'Нет спецсимволов' },
  { password: 'abc!@#$%', expected: false, reason: 'Нет цифр' },
  { password: '123!@#$%', expected: false, reason: 'Нет букв' },
  
  // Валидные пароли
  { password: 'Abc123!@', expected: true, reason: 'Все требования выполнены' },
  { password: 'Password1!', expected: true, reason: 'Заглавные и строчные буквы, цифра, спецсимвол' },
  { password: 'test123!', expected: true, reason: 'Строчные буквы, цифры, спецсимвол' },
  { password: 'MyP@ssw0rd', expected: true, reason: 'Смешанный регистр, цифры, спецсимвол' },
  { password: 'a1b2c3!@#', expected: true, reason: 'Буквы, цифры, спецсимволы' },
];

let passed = 0;
let failed = 0;

console.log('\n📋 Тестовые случаи:\n');

testCases.forEach((testCase, index) => {
  const result = validatePassword(testCase.password);
  const success = result.valid === testCase.expected;
  
  if (success) {
    passed++;
    console.log(`✅ Тест ${index + 1}: ПРОЙДЕН`);
  } else {
    failed++;
    console.log(`❌ Тест ${index + 1}: ПРОВАЛЕН`);
  }
  
  console.log(`   Пароль: "${testCase.password}"`);
  console.log(`   Причина: ${testCase.reason}`);
  console.log(`   Ожидалось: ${testCase.expected ? 'валидный' : 'невалидный'}`);
  console.log(`   Получено: ${result.valid ? 'валидный' : 'невалидный'}`);
  
  if (!result.valid) {
    console.log(`   Ошибка: ${result.error}`);
  }
  
  console.log(`   Требования:`);
  console.log(`     - Минимум 8 символов: ${result.requirements.minLength ? '✓' : '✗'}`);
  console.log(`     - Есть буква: ${result.requirements.hasLetter ? '✓' : '✗'}`);
  console.log(`     - Есть цифра: ${result.requirements.hasNumber ? '✓' : '✗'}`);
  console.log(`     - Есть спецсимвол: ${result.requirements.hasSpecialChar ? '✓' : '✗'}`);
  console.log('');
});

console.log('='.repeat(70));
console.log(`\n📊 Результаты: ${passed} пройдено, ${failed} провалено из ${testCases.length} тестов\n`);

if (failed === 0) {
  console.log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!\n');
  console.log('✅ Валидация пароля работает корректно:');
  console.log('   ✓ Требует минимум 8 символов');
  console.log('   ✓ Требует хотя бы одну букву (a-z, A-Z)');
  console.log('   ✓ Требует хотя бы одну цифру (0-9)');
  console.log('   ✓ Требует хотя бы один специальный символ (!@#$%^&* и т.д.)');
  console.log('\n🔒 Пароли теперь более безопасны!\n');
  process.exit(0);
} else {
  console.log('❌ НЕКОТОРЫЕ ТЕСТЫ ПРОВАЛЕНЫ\n');
  process.exit(1);
}
