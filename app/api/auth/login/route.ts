import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { signJWT } from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/cookies';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Поиск пользователя
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'invalidCredentials' },
        { status: 401 }
      );
    }

    // Проверка: если пользователь зарегистрирован через Google
    if (user.google_id && !user.password_hash) {
      return NextResponse.json(
        { error: 'googleAccount' },
        { status: 400 }
      );
    }

    // Проверка пароля
    if (!user.password_hash) {
      return NextResponse.json(
        { error: 'invalidCredentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'invalidCredentials' },
        { status: 401 }
      );
    }

    // Создание токенов
    const token = await signJWT({ userId: user.id, email: user.email }, '7d');
    const refreshToken = await signJWT({ userId: user.id, email: user.email }, '30d');

    // Сохранение refresh token в БД
    await prisma.sessions.create({
      data: {
        id: crypto.randomUUID(),
        user_id: user.id,
        refresh_token: refreshToken,
        user_agent: request.headers.get('user-agent') || undefined,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Обновление времени последнего входа
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    // Установка cookies
    await setAuthCookies(token, refreshToken);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'validation', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'serverError' },
      { status: 500 }
    );
  }
}
