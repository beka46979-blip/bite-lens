import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { signJWT } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";
import { validateStrongPassword } from "@/lib/auth/password-validation";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = registerSchema.parse(body);

    // Валидация сложного пароля
    const passwordValidation = validateStrongPassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 },
      );
    }

    // Проверка существования пользователя
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "emailExists" }, { status: 400 });
    }

    // Хеширование пароля
    const passwordHash = await hashPassword(password);

    // Создание пользователя с минимальными данными
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        email,
        password_hash: passwordHash,
        onboarding_completed: false,
      },
    });

    // Создание токенов
    const token = await signJWT(
      { userId: user.id, email: user.email, isEmailVerified: false },
      "7d",
    );
    const refreshToken = await signJWT(
      { userId: user.id, email: user.email, isEmailVerified: false },
      "30d",
    );

    // Сохранение refresh token в БД
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
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Создание trial-подписки на 3 дня
    await prisma.subscriptions.create({
      data: {
        id: crypto.randomUUID(),
        user_id: user.id,
        status: "TRIAL",
        plan_type: "FREE",
        trial_ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    });

    // Установка cookies
    await setAuthCookies(token, refreshToken);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "validation", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
