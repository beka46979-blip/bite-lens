import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code || code.length !== 6) {
      return NextResponse.json({ error: 'Invalid code format' }, { status: 400 });
    }

    // Получаем пользователя
    const user = await prisma.users.findUnique({
      where: { id: currentUser.userId },
      select: { 
        email_verification_code: true,
        is_email_verified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.is_email_verified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }

    if (!user.email_verification_code) {
      return NextResponse.json({ error: 'No verification code found' }, { status: 400 });
    }

    // Парсим код и время истечения
    const [storedCode, expiresAtStr] = user.email_verification_code.split(':');
    const expiresAt = parseInt(expiresAtStr);

    // Проверяем срок действия
    if (Date.now() > expiresAt) {
      return NextResponse.json({ error: 'Code expired' }, { status: 400 });
    }

    // Проверяем код
    if (storedCode !== code) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }

    // Подтверждаем email
    await prisma.users.update({
      where: { id: currentUser.userId },
      data: {
        is_email_verified: true,
        email_verification_code: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email успешно подтвержден',
    });
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
