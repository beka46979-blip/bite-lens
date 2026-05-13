import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { signJWT } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';
import { validateStrongPassword } from '@/lib/auth/password-validation';

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Валидация сложного пароля
    const passwordValidation = validateStrongPassword(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 });
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
    const codeExpiresAt = parseInt(expiresAtStr);

    // Проверяем срок действия
    if (Date.now() > codeExpiresAt) {
      return NextResponse.json({ error: 'Code expired' }, { status: 400 });
    }

    // Проверяем код
    if (storedCode !== code) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }

    // Хешируем новый пароль
    const passwordHash = await hashPassword(newPassword);

    // Обновляем пароль и удаляем токен
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: {
        password_hash: passwordHash,
        password_reset_token: null,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    // Удаляем все старые сессии пользователя (для безопасности)
    await prisma.sessions.deleteMany({
      where: { user_id: user.id },
    });

    // Создаем новую сессию и JWT токен
    const token = await signJWT({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    });

    // Создаем refresh token
    const refreshToken = crypto.randomUUID();
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 дней

    await prisma.sessions.create({
      data: {
        id: crypto.randomUUID(),
        user_id: updatedUser.id,
        refresh_token: refreshToken,
        expires_at: sessionExpiresAt,
      },
    });

    // Устанавливаем cookie с токеном
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 дней
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Пароль успешно изменен',
      token,
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
