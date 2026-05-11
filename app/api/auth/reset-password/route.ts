import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password too short' }, { status: 400 });
    }

    // Ищем пользователя
    const user = await prisma.users.findUnique({
      where: { email },
      select: { 
        id: true,
        password_reset_token: true,
      },
    });

    if (!user || !user.password_reset_token) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    // Парсим токен
    const [storedCode, expiresAtStr] = user.password_reset_token.split(':');
    const expiresAt = parseInt(expiresAtStr);

    // Проверяем срок действия
    if (Date.now() > expiresAt) {
      return NextResponse.json({ error: 'Code expired' }, { status: 400 });
    }

    // Проверяем код
    if (storedCode !== code) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }

    // Хешируем новый пароль
    const passwordHash = await hashPassword(newPassword);

    // Обновляем пароль и удаляем токен
    await prisma.users.update({
      where: { id: user.id },
      data: {
        password_hash: passwordHash,
        password_reset_token: null,
      },
    });

    // Удаляем все активные сессии пользователя (для безопасности)
    await prisma.session.deleteMany({
      where: { user_id: user.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Пароль успешно изменен',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
