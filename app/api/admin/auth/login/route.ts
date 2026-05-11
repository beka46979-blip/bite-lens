import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { Role } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'missingFields' }, { status: 400 });
    }

    // Ищем пользователя с ролью ADMIN по email
    const admin = await prisma.users.findFirst({
      where: { 
        email,
        role: Role.ADMIN,
      },
    });

    if (!admin) {
      return NextResponse.json({ error: 'invalidCredentials' }, { status: 401 });
    }

    // Проверяем пароль
    if (!admin.password_hash) {
      return NextResponse.json({ error: 'invalidCredentials' }, { status: 401 });
    }

    const isValidPassword = await verifyPassword(password, admin.password_hash);

    if (!isValidPassword) {
      return NextResponse.json({ error: 'invalidCredentials' }, { status: 401 });
    }

    // Генерируем 6-значный код
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    // Сохраняем код во временное хранилище (используем таблицу sessions)
    await prisma.sessions.create({
      data: {
        id: crypto.randomUUID(),
        user_id: admin.id,
        refresh_token: `admin_2fa:${code}:${expiresAt.getTime()}`,
        expires_at: expiresAt,
      },
    });

    // Получаем настройки Telegram
    let telegramSettings;
    try {
      telegramSettings = await prisma.settings.findMany({
        where: {
          key: {
            in: ['ADMIN_TELEGRAM_USER_ID', 'ADMIN_TELEGRAM_BOT_TOKEN'],
          },
        },
      });
    } catch (settingsError) {
      console.error('Settings table error:', settingsError);
      // Если таблица settings не существует или есть ошибка, возвращаем демо-код
      return NextResponse.json({
        success: true,
        message: 'Telegram не настроен',
        code, // Для демо
        adminId: admin.id,
      });
    }

    const telegramUserId = telegramSettings.find(s => s.key === 'ADMIN_TELEGRAM_USER_ID')?.value;
    const botToken = telegramSettings.find(s => s.key === 'ADMIN_TELEGRAM_BOT_TOKEN')?.value;

    if (!telegramUserId || !botToken || telegramUserId === 'YOUR_TELEGRAM_USER_ID' || botToken === 'YOUR_BOT_TOKEN') {
      return NextResponse.json({
        success: true,
        message: 'Telegram не настроен',
        code, // Для демо
        adminId: admin.id,
      });
    }

    // Отправляем код через Telegram
    try {
      const telegramMessage = `🔐 *Код для входа в админку Bite Lens*\n\nВаш код: \`${code}\`\n\nКод действителен 10 минут.`;
      
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramUserId,
          text: telegramMessage,
          parse_mode: 'Markdown',
        }),
      });

      if (!response.ok) {
        console.error('Telegram API error:', await response.text());
        return NextResponse.json({
          success: true,
          message: 'Ошибка отправки в Telegram',
          code, // Для демо
          adminId: admin.id,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Код отправлен в Telegram',
        adminId: admin.id,
      });
    } catch (error) {
      console.error('Telegram send error:', error);
      return NextResponse.json({
        success: true,
        message: 'Ошибка отправки в Telegram',
        code, // Для демо
        adminId: admin.id,
      });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ 
      error: 'serverError',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
