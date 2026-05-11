import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // TODO: Здесь будет интеграция с AI API (OpenAI Vision, Google Vision, или другой сервис)
    // Пока возвращаем mock данные для демонстрации
    
    // Создаем запись в food_snaps
    const foodSnap = await prisma.food_snaps.create({
      data: {
        id: crypto.randomUUID(),
        user_id: currentUser.userId,
        image_url: image, // В продакшене здесь будет URL из облачного хранилища
        analysis_status: 'PENDING',
      },
    });

    // Mock анализ (замените на реальный AI анализ)
    const mockAnalysis = {
      id: foodSnap.id,
      totalCalories: 450,
      totalProteins: 25,
      totalFats: 15,
      totalCarbs: 55,
      foods: [
        { name: 'Куриная грудка', calories: 165, proteins: 31, fats: 3.6, carbs: 0 },
        { name: 'Рис', calories: 130, proteins: 2.7, fats: 0.3, carbs: 28 },
        { name: 'Овощи', calories: 50, proteins: 2, fats: 0.5, carbs: 10 },
      ],
    };

    // Обновляем статус анализа
    await prisma.food_snaps.update({
      where: { id: foodSnap.id },
      data: {
        analysis_status: 'COMPLETED',
        ai_analysis_result: mockAnalysis as any,
        total_calories: mockAnalysis.totalCalories,
      },
    });

    return NextResponse.json(mockAnalysis);
  } catch (error) {
    console.error('Food analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
