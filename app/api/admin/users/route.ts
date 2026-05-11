import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const subscription = searchParams.get('subscription') || '';

    const skip = (page - 1) * limit;

    // Построение фильтров
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    // Получаем пользователей с пагинацией
    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          gender: true,
          height_cm: true,
          weight_start: true,
          weight_goal: true,
          is_email_verified: true,
          two_factor_enabled: true,
          created_at: true,
          updated_at: true,
        },
      }),
      prisma.users.count({ where }),
    ]);

    // Сериализация дат и Decimal
    const serializedUsers = users.map(user => ({
      ...user,
      email_verified: user.is_email_verified,
      height_cm: user.height_cm ? Number(user.height_cm) : null,
      weight_start: user.weight_start ? Number(user.weight_start) : null,
      weight_goal: user.weight_goal ? Number(user.weight_goal) : null,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
    }));

    return NextResponse.json({
      users: serializedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
