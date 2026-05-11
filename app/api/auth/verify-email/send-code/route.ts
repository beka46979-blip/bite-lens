import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export async function POST() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем данные пользователя
    const user = await prisma.users.findUnique({
      where: { id: currentUser.userId },
      select: { 
        email: true, 
        name: true,
        is_email_verified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.is_email_verified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }

    // Генерируем 6-значный код
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Сохраняем код в БД с временной меткой (код действителен 10 минут)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.users.update({
      where: { id: currentUser.userId },
      data: {
        email_verification_code: `${code}:${expiresAt.getTime()}`,
      },
    });

    // Отправляем код на email
    try {
      const template = getEmailVerificationTemplate(code, user.name || undefined);
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log(`Email verification code sent to ${user.email}: ${code}`);

      return NextResponse.json({
        success: true,
        message: 'Код отправлен на email',
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
      
      // Если email не настроен, возвращаем код для демо
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          message: 'Email не настроен. Код для демо:',
          code: code,
        });
      }

      return NextResponse.json(
        { error: 'Не удалось отправить email. Проверьте настройки SMTP.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Send verification code error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

function getEmailVerificationTemplate(code: string, userName?: string) {
  return {
    subject: 'Подтверждение email - Bite Lens',
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
          <h1>Подтверждение Email</h1>
          ${userName ? `<p>Привет, ${userName}!</p>` : ''}
          <p>Спасибо за регистрацию! Используйте этот код для подтверждения вашего email:</p>
          
          <div class="code-container">
            <p style="margin: 0; color: #666; font-size: 14px;">Ваш код подтверждения:</p>
            <div class="code">${code}</div>
            <p style="margin: 0; color: #666; font-size: 14px;">Код действителен 10 минут</p>
          </div>

          <div class="warning">
            ⚠️ Если вы не регистрировались на Bite Lens, проигнорируйте это письмо.
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
Bite Lens - Подтверждение Email

${userName ? `Привет, ${userName}!` : ''}

Спасибо за регистрацию! Ваш код подтверждения: ${code}

Код действителен 10 минут.

Если вы не регистрировались на Bite Lens, проигнорируйте это письмо.

С уважением,
Команда Bite Lens
    `.trim(),
  };
}
