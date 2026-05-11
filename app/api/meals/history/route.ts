import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Получаем приёмы пищи с фотографиями
    const meals = await prisma.food_snaps.findMany({
      where: {
        user_id: currentUser.userId,
      },
      orderBy: {
        created_at: 'desc',
      },
      skip,
      take: limit,
      select: {
        id: true,
        image_url: true,
        dish_name: true,
        calories: true,
        proteins: true,
        fats: true,
        carbs: true,
        weight_gram: true,
        ai_verdict: true,
        confidence_score: true,
        created_at: true,
        meals: {
          select: {
            meal_type: true,
          },
        },
      },
    });

    // Получаем общее количество для пагинации
    const total = await prisma.food_snaps.count({
      where: {
        user_id: currentUser.userId,
      },
    });

    // Конвертируем Decimal в number
    const mealsData = meals.map((meal) => ({
      id: meal.id,
      imageUrl: meal.image_url,
      dishName: meal.dish_name,
      calories: meal.calories,
      proteins: meal.proteins ? Number(meal.proteins) : null,
      fats: meal.fats ? Number(meal.fats) : null,
      carbs: meal.carbs ? Number(meal.carbs) : null,
      weightGram: meal.weight_gram,
      aiVerdict: meal.ai_verdict,
      confidenceScore: meal.confidence_score ? Number(meal.confidence_score) : null,
      createdAt: meal.created_at,
      mealType: meal.meals?.meal_type || null,
    }));

    return NextResponse.json({
      meals: mealsData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching meal history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
