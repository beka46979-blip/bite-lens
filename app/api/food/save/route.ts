import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { MealType } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      imageUrl,
      mealType,
      dishName,
      totalCalories,
      totalProteins,
      totalFats,
      totalCarbs,
      weightGram,
      confidence,
      verdict,
      tokensUsed,
    } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Создаем запись meal
    const meal = await prisma.meals.create({
      data: {
        id: crypto.randomUUID(),
        user_id: currentUser.userId,
        meal_type: (mealType as MealType) || MealType.SNACK,
      },
    });

    // Создаем запись в food_snaps
    const foodSnap = await prisma.food_snaps.create({
      data: {
        id: crypto.randomUUID(),
        user_id: currentUser.userId,
        meal_id: meal.id,
        image_url: imageUrl,
        dish_name: dishName,
        calories: totalCalories,
        proteins: totalProteins,
        fats: totalFats,
        carbs: totalCarbs,
        weight_gram: weightGram,
        ai_verdict: verdict,
        confidence_score: confidence,
      },
    });

    // Логируем использование AI
    await prisma.ai_logs.create({
      data: {
        id: crypto.randomUUID(),
        user_id: currentUser.userId,
        snap_id: foodSnap.id,
        model_name: 'gpt-4o-mini',
        request_payload: { imageUrl, mealType },
        response_payload: body,
        tokens_used: tokensUsed || 0,
        status: 'SUCCESS',
      },
    });

    // Обновляем daily_nutrition_summary
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingSummary = await prisma.daily_nutrition_summary.findUnique({
      where: {
        user_id_date: {
          user_id: currentUser.userId,
          date: today,
        },
      },
    });

    if (existingSummary) {
      await prisma.daily_nutrition_summary.update({
        where: {
          user_id_date: {
            user_id: currentUser.userId,
            date: today,
          },
        },
        data: {
          total_calories: existingSummary.total_calories + (totalCalories || 0),
          total_proteins: Number(existingSummary.total_proteins) + (totalProteins || 0),
          total_fats: Number(existingSummary.total_fats) + (totalFats || 0),
          total_carbs: Number(existingSummary.total_carbs) + (totalCarbs || 0),
          snaps_count: existingSummary.snaps_count + 1,
          kcal_diff:
            existingSummary.total_calories +
            (totalCalories || 0) -
            (existingSummary.kcal_target || 0),
        },
      });
    } else {
      const user = await prisma.users.findUnique({
        where: { id: currentUser.userId },
        select: { daily_kcal_target: true },
      });

      await prisma.daily_nutrition_summary.create({
        data: {
          id: crypto.randomUUID(),
          user_id: currentUser.userId,
          date: today,
          total_calories: totalCalories || 0,
          total_proteins: totalProteins || 0,
          total_fats: totalFats || 0,
          total_carbs: totalCarbs || 0,
          snaps_count: 1,
          kcal_target: user?.daily_kcal_target || 2000,
          kcal_diff: (totalCalories || 0) - (user?.daily_kcal_target || 2000),
        },
      });
    }

    // ===== УДАРНЫЙ РЕЖИМ (STREAK) =====
    // - Если streak ещё не существует → создаём с current_streak = 1
    // - Если последний приём пищи был сегодня → ничего не меняем (огонёк уже выдан)
    // - Если последний приём пищи был вчера → +1 к current_streak
    // - Иначе (пропущен день или больше) → сбрасываем current_streak = 1
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const existingStreak = await prisma.streaks.findUnique({
      where: { user_id: currentUser.userId },
    });

    let newCurrentStreak = 1;
    let newMaxStreak = 1;
    // isFirstLogToday = true означает: огонёк ещё не выдавался сегодня
    let isFirstLogToday = true;

    if (existingStreak) {
      const lastLogDate = new Date(existingStreak.last_log_date);
      lastLogDate.setHours(0, 0, 0, 0);

      if (lastLogDate.getTime() === today.getTime()) {
        // Уже логировал сегодня — огонёк уже был выдан, не показываем снова
        newCurrentStreak = existingStreak.current_streak;
        newMaxStreak = existingStreak.max_streak;
        isFirstLogToday = false;
      } else if (lastLogDate.getTime() === yesterday.getTime()) {
        // Логировал вчера — продолжаем серию
        newCurrentStreak = existingStreak.current_streak + 1;
        newMaxStreak = Math.max(existingStreak.max_streak, newCurrentStreak);
      } else {
        // Пропустил день или больше — сбрасываем
        newCurrentStreak = 1;
        newMaxStreak = Math.max(existingStreak.max_streak, 1);
      }

      await prisma.streaks.update({
        where: { user_id: currentUser.userId },
        data: {
          current_streak: newCurrentStreak,
          max_streak: newMaxStreak,
          last_log_date: today,
        },
      });
    } else {
      await prisma.streaks.create({
        data: {
          user_id: currentUser.userId,
          current_streak: 1,
          max_streak: 1,
          last_log_date: today,
        },
      });
    }

    return NextResponse.json({
      success: true,
      mealId: meal.id,
      foodSnapId: foodSnap.id,
      streak: {
        current: newCurrentStreak,
        max: newMaxStreak,
        isFirstLogToday,
      },
    });
  } catch (error: any) {
    console.error('Save meal error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save meal' },
      { status: 500 }
    );
  }
}
