import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  birthDate: z.string(),
  heightCm: z.coerce.number().min(100).max(250),
  weightStart: z.coerce.number().min(30).max(300),
  weightGoal: z.coerce.number().min(30).max(300),
  activityLevel: z.number().min(1).max(5),
  weeklyTrainings: z.number().min(0).max(7).optional(),
  goalType: z.enum(['LOSE_WEIGHT', 'GAIN_WEIGHT', 'MAINTAIN_WEIGHT']).optional(),
  professionId: z.string().optional(),
});

// Формула Миффлина-Сан Жеора для расчета базового метаболизма
function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: 'MALE' | 'FEMALE' | 'OTHER'
): number {
  if (gender === 'MALE') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else if (gender === 'FEMALE') {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    // Для OTHER используем среднее значение
    return 10 * weight + 6.25 * height - 5 * age - 78;
  }
}

// Коэффициенты активности
const activityMultipliers: Record<number, number> = {
  1: 1.2,   // Минимальная
  2: 1.375, // Низкая
  3: 1.55,  // Средняя
  4: 1.725, // Высокая
  5: 1.9,   // Очень высокая
};

// Коэффициенты профессии
const professionMultipliers: Record<string, number> = {
  'sedentary': 1.0,      // Офисная работа
  'light': 1.1,          // Легкая активность
  'moderate': 1.2,       // Умеренная активность
  'active': 1.3,         // Активная работа
  'very_active': 1.4,    // Очень активная
};

// Дополнительные калории за тренировку
const caloriesPerTraining = 200;

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = profileSchema.parse(body);

    // Вычисляем возраст
    const birthDate = new Date(data.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    // Рассчитываем базовый метаболизм (BMR)
    const bmr = calculateBMR(
      data.weightStart,
      data.heightCm,
      age,
      data.gender
    );

    // Применяем коэффициент активности
    let dailyKcalTarget = bmr * activityMultipliers[data.activityLevel];

    // Применяем коэффициент профессии
    if (data.professionId && professionMultipliers[data.professionId]) {
      dailyKcalTarget *= professionMultipliers[data.professionId];
    }

    // Добавляем калории за тренировки
    if (data.weeklyTrainings) {
      const trainingCaloriesPerDay = (data.weeklyTrainings * caloriesPerTraining) / 7;
      dailyKcalTarget += trainingCaloriesPerDay;
    }

    // Корректируем в зависимости от цели
    if (data.goalType === 'LOSE_WEIGHT') {
      dailyKcalTarget -= 500; // Дефицит для похудения
    } else if (data.goalType === 'GAIN_WEIGHT') {
      dailyKcalTarget += 500; // Профицит для набора массы
    }

    dailyKcalTarget = Math.round(dailyKcalTarget);

    // Обновляем профиль пользователя
    const user = await prisma.users.update({
      where: { id: currentUser.userId },
      data: {
        name: data.name || null,
        gender: data.gender,
        birth_date: birthDate,
        height_cm: data.heightCm,
        weight_start: data.weightStart,
        weight_goal: data.weightGoal,
        activity_level: data.activityLevel,
        daily_kcal_target: dailyKcalTarget,
        onboarding_completed: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        dailyKcalTarget: user.daily_kcal_target,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'validation', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'serverError' },
      { status: 500 }
    );
  }
}
