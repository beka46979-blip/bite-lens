import nodemailer from 'nodemailer';

// Создаем транспорт для отправки email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true для 465, false для других портов
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"Bite Lens" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Fallback на текст без HTML
      html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

// Шаблон для 2FA кода
export function get2FAEmailTemplate(code: string, userName?: string) {
  return {
    subject: 'Код подтверждения Bite Lens',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
            border-radius: 16px;
            padding: 40px;
            text-align: center;
            color: white;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .code-container {
            background: white;
            color: #333;
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
          }
          .code {
            font-size: 48px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #10b981;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
          }
          .warning {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🍽️ Bite Lens</div>
          <h1>Код подтверждения</h1>
          ${userName ? `<p>Привет, ${userName}!</p>` : ''}
          <p>Используйте этот код для подтверждения двухфакторной аутентификации:</p>
          
          <div class="code-container">
            <p style="margin: 0; color: #666; font-size: 14px;">Ваш код подтверждения:</p>
            <div class="code">${code}</div>
            <p style="margin: 0; color: #666; font-size: 14px;">Код действителен 10 минут</p>
          </div>

          <div class="warning">
            ⚠️ Если вы не запрашивали этот код, проигнорируйте это письмо.
            Никому не сообщайте этот код!
          </div>

          <div class="footer">
            <p>С уважением,<br>Команда Bite Lens</p>
            <p style="font-size: 12px; margin-top: 20px;">
              Это автоматическое письмо, пожалуйста, не отвечайте на него.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Bite Lens - Код подтверждения

${userName ? `Привет, ${userName}!` : ''}

Ваш код подтверждения: ${code}

Код действителен 10 минут.

Если вы не запрашивали этот код, проигнорируйте это письмо.
Никому не сообщайте этот код!

С уважением,
Команда Bite Lens
    `.trim(),
  };
}
