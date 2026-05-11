import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { analysisId } = await request.json();

    if (!analysisId) {
      return NextResponse.json({ error: 'Analysis ID is required' }, { status: 400 });
    }

    // Получаем результаты анализа
    const foodSnap = await prisma.food_snaps.findUnique({
      where: { id: analysisId },
    });

    if (!foodSnap || foodSnap.user_id !== currentUser.userId) {
      return NextResponse.json({ error: 'Food snap not found' }, { status: 404 });
    }

    // Создаем прием пищи
    const meal = await prisma.meals.create({
      data: {
        id: crypto.randomUUID(),
        user_id: currentUser.userId,
        meal_type: 'SNACK', // По умолчанию, можно добавить выбор типа
        total_calories: foodSnap.total_calories || 0,
        food_snap_id: foodSnap.id,
      },
    });

    // Обновляем дневную статистику
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailySummary = await prisma.daily_nutrition_summary.findFirst({
      where: {
        user_id: currentUser.userId,
        date: today,
      },
    });

    if (dailySummary) {
      await prisma.daily_nutrition_summary.update({
        where: { id: dailySummary.id },
        data: {
          total_calories: {
            increment: foodSnap.total_calories || 0,
          },
        },
      });
    } else {
      await prisma.daily_nutrition_summary.create({
        data: {
          id: crypto.randomUUID(),
          user_id: currentUser.userId,
          date: today,
          total_calories: foodSnap.total_calories || 0,
          total_proteins: 0,
          total_fats: 0,
          total_carbs: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      meal,
    });
  } catch (error) {
    console.error('Save meal error:', error);
    return NextResponse.json(
      { error: 'Failed to save meal' },
      { status: 500 }
    );
  }
}
