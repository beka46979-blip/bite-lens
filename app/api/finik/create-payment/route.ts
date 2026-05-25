// app/api/finik/create-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth/jwt';
import { createFinikPayment } from '@/lib/finik';

const FIXED_AMOUNT = 5; // Цена фиксирована: 5 сом

/**
 * POST /api/finik/create-payment
 * Создает платеж в Finik (фиксированная цена 5 сом)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Аутентификация пользователя
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyJWT(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Получение данных из запроса
    const body = await request.json();
    const { planType } = body;

    if (!planType) {
      return NextResponse.json(
        { error: 'Missing required field: planType' },
        { status: 400 }
      );
    }

    // 3. Создание платежа в Finik (цена всегда 5 сом)
    const paymentUrl = await createFinikPayment({
      amount: FIXED_AMOUNT,
      workId: planType,
      workTopic: `Подписка ${planType}`,
      userId: user.userId,
    });

    // 4. Возврат URL платежной страницы
    return NextResponse.json({
      success: true,
      paymentUrl,
      amount: FIXED_AMOUNT,
    });

  } catch (error) {
    console.error('Error creating Finik payment:', error);
    return NextResponse.json(
      {
        error: 'Failed to create payment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
