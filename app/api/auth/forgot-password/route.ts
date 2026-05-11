import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Ищем пользователя
    const user = await prisma.users.findUnique({
      where: { email },
      select: { 
        id: true, 
        email: true, 
        name: true,
        google_id: true,
      },
    });

    // Всегда возвращаем успех (для безопасности, чтобы не раскрывать существование email)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Если email существует, на него отправлена ссылка для сброса пароля',
      });
    }

    // Проверяем, не OAuth пользователь ли это
    if (user.google_id) {
      return NextResponse.json({
        success: true,
        message: 'Если email существует, на него отправлена ссылка для сброса пароля',
      });
    }

    // Генерируем токен сброса (6-значный код + время истечения)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 минут

    // Сохраняем токен в БД
    await prisma.users.update({
      where: { id: user.id },
      data: {
        password_reset_token: `${resetCode}:${expiresAt.getTime()}`,
      },
    });

    // Отправляем email
    try {
      const template = getPasswordResetTemplate(resetCode, user.name || undefined);
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log(`Password reset code sent to ${user.email}: ${resetCode}`);

      return NextResponse.json({
        success: true,
        message: 'Код для сброса пароля отправлен на email',
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
      
      // Если email не настроен, возвращаем код для демо
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          message: 'Email не настроен. Код для демо:',
          code: resetCode,
        });
      }

      return NextResponse.json(
        { error: 'Не удалось отправить email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

function getPasswordResetTemplate(code: string, userName?: string) {
  return {
    subject: 'Сброс пароля - Bite Lens',
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
          <h1>Сброс пароля</h1>
          ${userName ? `<p>Привет, ${userName}!</p>` : ''}
          <p>Вы запросили сброс пароля. Используйте этот код:</p>
          
          <div class="code-container">
            <p style="margin: 0; color: #666; font-size: 14px;">Код для сброса пароля:</p>
            <div class="code">${code}</div>
            <p style="margin: 0; color: #666; font-size: 14px;">Код действителен 15 минут</p>
          </div>

          <div class="warning">
            ⚠️ Если вы не запрашивали сброс пароля, проигнорируйте это письмо.
            Ваш пароль останется без изменений.
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
Bite Lens - Сброс пароля

${userName ? `Привет, ${userName}!` : ''}

Вы запросили сброс пароля. Ваш код: ${code}

Код действителен 15 минут.

Если вы не запрашивали сброс пароля, проигнорируйте это письмо.

С уважением,
Команда Bite Lens
    `.trim(),
  };
}
