import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Отключаем 2FA
    await prisma.users.update({
      where: { id: currentUser.userId },
      data: {
        two_factor_enabled: false,
        two_factor_secret: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
