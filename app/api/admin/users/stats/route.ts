import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const today = new Date(now.setHours(0, 0, 0, 0));

    const [
      totalUsers,
      newUsersLast24h,
      activeToday,
      totalAdmins,
      verifiedUsers,
    ] = await Promise.all([
      prisma.users.count({
        where: { role: 'USER' },
      }),
      prisma.users.count({
        where: {
          role: 'USER',
          created_at: { gte: yesterday },
        },
      }),
      prisma.sessions.count({
        where: {
          created_at: { gte: today },
        },
      }),
      prisma.users.count({
        where: { role: 'ADMIN' },
      }),
      prisma.users.count({
        where: {
          role: 'USER',
          is_email_verified: true,
        },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      newUsersLast24h,
      activeToday,
      totalAdmins,
      verifiedUsers,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
