import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const enableSchema = z.object({
  code: z.string().length(6),
});

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code } = enableSchema.parse(body);

    // Получаем пользователя с сохраненным кодом
    const user = await prisma.users.findUnique({
      where: { id: currentUser.userId },
      select: { two_factor_secret: true },
    });

    if (!user || !user.two_factor_secret) {
      return NextResponse.json({ error: 'Код не найден. Запросите новый код.' }, { status: 400 });
    }

    // Парсим код и время истечения
    const [savedCode, expiresAtStr] = user.two_factor_secret.split(':');
    const expiresAt = parseInt(expiresAtStr);

    // Проверяем истечение кода
    if (Date.now() > expiresAt) {
      return NextResponse.json({ error: 'Код истек. Запросите новый код.' }, { status: 400 });
    }

    // Проверяем код
    if (savedCode !== code) {
      return NextResponse.json({ error: 'Неверный код' }, { status: 400 });
    }

    // Включаем 2FA
    await prisma.users.update({
      where: { id: currentUser.userId },
      data: {
        two_factor_enabled: true,
        two_factor_secret: null, // Очищаем временный код
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверный формат кода' }, { status: 400 });
    }

    console.error('Enable 2FA error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
