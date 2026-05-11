import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signJWT } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { adminId, code } = await request.json();

    if (!adminId || !code) {
      return NextResponse.json({ error: 'missingFields' }, { status: 400 });
    }

    // Ищем сессию с кодом
    const session = await prisma.sessions.findFirst({
      where: {
        user_id: adminId,
        refresh_token: {
          startsWith: 'admin_2fa:',
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'invalidCode' }, { status: 400 });
    }

    // Парсим код и время истечения
    const [, storedCode, expiresAtStr] = session.refresh_token.split(':');
    const expiresAt = parseInt(expiresAtStr);

    // Проверяем срок действия
    if (Date.now() > expiresAt) {
      await prisma.sessions.delete({ where: { id: session.id } });
      return NextResponse.json({ error: 'codeExpired' }, { status: 400 });
    }

    // Проверяем код
    if (storedCode !== code) {
      return NextResponse.json({ error: 'invalidCode' }, { status: 400 });
    }

    // Удаляем использованный код
    await prisma.sessions.delete({ where: { id: session.id } });

    // Получаем данные админа
    const admin = await prisma.users.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return NextResponse.json({ error: 'adminNotFound' }, { status: 404 });
    }

    // Создаем токены
    const token = await signJWT(
      { userId: admin.id, email: admin.email, role: admin.role, isAdmin: true },
      '7d'
    );
    const refreshToken = await signJWT(
      { userId: admin.id, email: admin.email, role: admin.role, isAdmin: true },
      '30d'
    );

    // Сохраняем refresh token
    await prisma.sessions.create({
      data: {
        id: crypto.randomUUID(),
        user_id: admin.id,
        refresh_token: refreshToken,
        user_agent: request.headers.get('user-agent') || undefined,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Устанавливаем cookies
    const cookieStore = await cookies();
    
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    cookieStore.set('admin_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin verify error:', error);
    return NextResponse.json({ error: 'serverError' }, { status: 500 });
  }
}
