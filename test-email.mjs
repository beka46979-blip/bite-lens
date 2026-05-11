import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('📧 Тестирование SMTP настроек...\n');

console.log('Настройки:');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '***' + process.env.SMTP_PASSWORD.slice(-4) : 'не установлен');
console.log('');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

try {
  console.log('🔄 Проверка подключения к SMTP серверу...');
  await transporter.verify();
  console.log('✅ Подключение успешно!\n');

  console.log('📨 Отправка тестового письма...');
  const info = await transporter.sendMail({
    from: `"Bite Lens Test" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER,
    subject: 'Тест SMTP - Bite Lens',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); border-radius: 16px; color: white; text-align: center;">
        <h1>🎉 SMTP работает!</h1>
        <p>Это тестовое письмо от Bite Lens</p>
        <div style="background: white; color: #333; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p style="font-size: 48px; font-weight: bold; color: #10b981; margin: 0;">123456</p>
          <p style="color: #666; margin: 10px 0 0 0;">Тестовый код</p>
        </div>
        <p style="font-size: 14px; opacity: 0.8;">Если вы получили это письмо, значит SMTP настроен правильно!</p>
      </div>
    `,
    text: 'SMTP работает! Это тестовое письмо от Bite Lens. Тестовый код: 123456',
  });

  console.log('✅ Письмо успешно отправлено!');
  console.log('Message ID:', info.messageId);
  console.log('\n📬 Проверьте почту:', process.env.SMTP_USER);
  console.log('Не забудьте проверить папку "Спам"!\n');
} catch (error) {
  console.error('❌ Ошибка:', error.message);
  console.log('\n💡 Возможные причины:');
  console.log('1. Неверный App Password (для Gmail нужен App Password, не обычный пароль)');
  console.log('2. Двухфакторная аутентификация не включена в Google аккаунте');
  console.log('3. Неверный email или пароль');
  console.log('4. Блокировка со стороны почтового сервера');
  console.log('\n📖 Инструкция для Gmail App Password:');
  console.log('1. Откройте https://myaccount.google.com/apppasswords');
  console.log('2. Войдите в аккаунт Google');
  console.log('3. Создайте новый App Password');
  console.log('4. Скопируйте пароль (16 символов без пробелов)');
  console.log('5. Вставьте в .env файл в SMTP_PASSWORD\n');
}
