import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';
import { validateStrongPassword } from '@/lib/auth/password-validation';
import { signJWT } from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/cookies';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { newEmail, newPassword } = body;

    // Получаем текущего пользователя
    const user = await prisma.users.findUnique({
      where: { id: currentUser.userId },
      select: {
        id: true,
        email: true,
        is_email_verified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Разрешаем изменения только для неподтвержденных пользователей
    if (user.is_email_verified) {
      return NextResponse.json(
        { error: 'Cannot update verified account' },
        { status: 400 }
      );
    }

    const updateData: any = {};

    // Обновление email
    if (newEmail && newEmail !== user.email) {
      // Проверяем, не занят ли новый email
      const existingUser = await prisma.users.findUnique({
        where: { email: newEmail },
      });

      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          { error: 'Email уже используется' },
          { status: 400 }
        );
      }

      updateData.email = newEmail;
    }

    // Обновление пароля
    if (newPassword) {
      const passwordValidation = validateStrongPassword(newPassword);
      if (!passwordValidation.valid) {
        return NextResponse.json(
          { error: passwordValidation.error },
          { status: 400 }
        );
      }

      const passwordHash = await hashPassword(newPassword);
      updateData.password_hash = passwordHash;
    }

    // Если есть что обновлять
    if (Object.keys(updateData).length > 0) {
      await prisma.users.update({
        where: { id: user.id },
        data: updateData,
      });

      // Если email изменился, обновляем токены
      if (updateData.email) {
        const token = await signJWT(
          { userId: user.id, email: updateData.email, isEmailVerified: false },
          '7d'
        );
        const refreshToken = await signJWT(
          { userId: user.id, email: updateData.email, isEmailVerified: false },
          '30d'
        );

        // Обновляем refresh token в БД
        await prisma.sessions.updateMany({
          where: { user_id: user.id },
          data: { refresh_token: refreshToken },
        });

        await setAuthCookies(token, refreshToken);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update unverified account error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
