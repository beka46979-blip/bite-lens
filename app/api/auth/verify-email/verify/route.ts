import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signJWT } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Получаем временный токен
    const cookieStore = await cookies();
    const tempToken = cookieStore.get('tempToken');

    if (!tempToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Декодируем токен
    const payload = JSON.parse(Buffer.from(tempToken.value.split('.')[1], 'base64').toString());
    const email = payload.email;

    if (!email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: "Invalid code format" },
        { status: 400 },
      );
    }

    // Получаем pending регистрацию
    const pendingReg = await prisma.pending_registrations.findUnique({
      where: { email },
    });

    console.log('🔍 Проверка кода для:', email);
    console.log('📝 Введенный код:', code);
    console.log('✅ Ожидаемый код:', pendingReg?.verification_code);
    console.log('⏰ Срок действия:', pendingReg?.code_expires_at.toLocaleString('ru-RU'));
    console.log('🕐 Текущее время:', new Date().toLocaleString('ru-RU'));

    if (!pendingReg) {
      console.error('❌ Pending регистрация не найдена для:', email);
      return NextResponse.json(
        { error: "No verification code found" },
        { status: 400 },
      );
    }

    // Проверяем срок действия
    if (new Date() > pendingReg.code_expires_at) {
      console.error('❌ Код истек для:', email);
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    // Проверяем код
    if (pendingReg.verification_code !== code) {
      console.error('❌ Неверный код для:', email);
      console.error('   Введено:', code);
      console.error('   Ожидается:', pendingReg.verification_code);
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    console.log('✅ Код верный! Создаем или обновляем пользователя...');

    // ✅ КОД ВЕРНЫЙ - СОЗДАЕМ ИЛИ ОБНОВЛЯЕМ ПОЛЬЗОВАТЕЛЯ
    const userId = crypto.randomUUID();
    
    // Используем upsert вместо create, чтобы обновить пользователя если он уже существует
    const user = await prisma.users.upsert({
      where: { email: pendingReg.email },
      create: {
        id: userId,
        email: pendingReg.email,
        password_hash: pendingReg.password_hash,
        is_email_verified: true, // Сразу подтвержден
        onboarding_completed: false,
      },
      update: {
        password_hash: pendingReg.password_hash, // Обновляем пароль если пользователь существует
        is_email_verified: true,
      },
    });

    console.log('✅ Пользователь создан/обновлен:', user.email);

    // Удаляем старые сессии пользователя (если есть)
    await prisma.sessions.deleteMany({
      where: { user_id: user.id },
    });

    // Создаем новую сессию
    const token = await signJWT(
      { userId: user.id, email: user.email, isEmailVerified: true },
      "7d",
    );
    const refreshToken = await signJWT(
      { userId: user.id, email: user.email, isEmailVerified: true },
      "30d",
    );

    await prisma.sessions.create({
      data: {
        id: crypto.randomUUID(),
        user_id: user.id,
        refresh_token: refreshToken,
        user_agent: request.headers.get("user-agent") || undefined,
        ip_address:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          undefined,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    console.log('✅ Сессия создана для пользователя:', user.email);

    // Создаем или обновляем trial-подписку
    // Сначала ищем существующую подписку
    const existingSubscription = await prisma.subscriptions.findFirst({
      where: { user_id: user.id },
    });

    if (existingSubscription) {
      // Обновляем существующую подписку
      await prisma.subscriptions.update({
        where: { id: existingSubscription.id },
        data: {
          status: "TRIAL",
          plan_type: "FREE",
          trial_ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      });
      console.log('✅ Подписка обновлена для:', user.email);
    } else {
      // Создаем новую подписку
      await prisma.subscriptions.create({
        data: {
          id: crypto.randomUUID(),
          user_id: user.id,
          status: "TRIAL",
          plan_type: "FREE",
          trial_ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      });
      console.log('✅ Подписка создана для:', user.email);
    }

    // Удаляем pending регистрацию
    await prisma.pending_registrations.delete({
      where: { email },
    });

    // Удаляем временный токен и устанавливаем настоящие
    cookieStore.delete('tempToken');
    await setAuthCookies(token, refreshToken);

    return NextResponse.json({
      success: true,
      message: "Email успешно подтвержден, аккаунт создан",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
