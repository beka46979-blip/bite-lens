// app/api/finik/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  verifyFinikWebhook,
  isTimestampValid,
  FinikWebhookData,
} from '@/lib/finik';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/finik/webhook
 * Обрабатывает webhook от Finik после завершения платежа
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Получение заголовков
    const signature = request.headers.get('signature');
    const timestamp = request.headers.get('x-api-timestamp');
    const host = request.headers.get('host');

    if (!signature || !timestamp) {
      console.error('Missing signature or timestamp in webhook');
      return NextResponse.json(
        { error: 'Missing signature or timestamp' },
        { status: 400 }
      );
    }

    // 2. Проверка актуальности timestamp (защита от replay-атак)
    if (!isTimestampValid(timestamp)) {
      console.error('Webhook timestamp is too old or invalid');
      return NextResponse.json(
        { error: 'Invalid timestamp' },
        { status: 400 }
      );
    }

    // 3. Получение тела запроса
    const body: FinikWebhookData = await request.json();

    // 4. Подготовка заголовков для верификации
    const headers: Record<string, string> = {
      'host': host || '',
    };

    // 5. Верификация подписи
    const webhookPath = '/api/finik/webhook';
    const isValid = await verifyFinikWebhook(
      signature,
      timestamp,
      body as unknown as Record<string, unknown>,
      headers,
      webhookPath
    );

    if (!isValid) {
      console.error('Invalid webhook signature');

      // В продакшене всегда отклоняем невалидные подписи
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // 6. Извлечение метаданных
    let metadata: {
      userId?: string;
      workId?: string;
      paymentId?: string;
    } = {};

    try {
      if (body.data && body.data.metadata) {
        if (typeof body.data.metadata === 'string') {
          metadata = JSON.parse(body.data.metadata);
        } else {
          metadata = body.data.metadata as typeof metadata;
        }
      }
    } catch (error) {
      console.error('Error parsing metadata:', error);
    }

    // 7. Обработка успешного платежа
    if (body.status === 'SUCCEEDED' || body.status === 'succeeded') {
      const { userId, workId } = metadata;

      if (!userId || !workId) {
        console.error('Missing userId or workId in metadata');
        return NextResponse.json(
          { error: 'Missing metadata' },
          { status: 400 }
        );
      }

      console.log(`[PAYMENT_SUCCESS] Plan: ${workId} | Amount: ${body.amount} | Transaction: ${body.transactionId} | User: ${userId}`);

      // Активация подписки пользователя
      const existingSub = await prisma.subscriptions.findFirst({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
      });

      if (existingSub) {
        await prisma.subscriptions.update({
          where: { id: existingSub.id },
          data: {
            status: 'ACTIVE',
            plan_type: workId,
          },
        });
      } else {
        await prisma.subscriptions.create({
          data: {
            id: crypto.randomUUID(),
            user_id: userId,
            status: 'ACTIVE',
            plan_type: workId,
          },
        });
      }

      console.log(`[SUBSCRIPTION_ACTIVATED] User: ${userId} | Plan: ${workId}`);
    }
    // 8. Обработка неудачного платежа
    else if (body.status === 'FAILED' || body.status === 'failed') {
      const { userId, workId } = metadata;
      console.error('[PAYMENT_FAILED]', { userId, workId, transactionId: body.transactionId });
    }

    // 9. Возврат успешного ответа
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error processing Finik webhook:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
