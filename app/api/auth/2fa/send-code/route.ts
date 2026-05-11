import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { sendEmail, get2FAEmailTemplate } from '@/lib/email';

export async function POST() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем данные пользователя
    const user = await prisma.users.findUnique({
      where: { id: currentUser.userId },
      select: { email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Генерируем 6-значный код
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Сохраняем код в БД с временной меткой (код действителен 10 минут)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.users.update({
      where: { id: currentUser.userId },
      data: {
        two_factor_secret: `${code}:${expiresAt.getTime()}`,
      },
    });

    // Отправляем код на email
    try {
      const template = get2FAEmailTemplate(code, user.name || undefined);
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log(`2FA Code sent to ${user.email}: ${code}`);

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
    console.error('Send 2FA code error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
