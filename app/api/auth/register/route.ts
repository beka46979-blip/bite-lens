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

    // Проверка существования подтвержденного пользователя
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.is_email_verified) {
      return NextResponse.json({ error: "emailExists" }, { status: 400 });
    }

    // Хеширование пароля
    const passwordHash = await hashPassword(password);

    // Генерация 6-значного кода
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 минут

    // Сохраняем во временную таблицу (upsert - обновляем если уже есть)
    await prisma.pending_registrations.upsert({
      where: { email },
      create: {
        id: crypto.randomUUID(),
        email,
        password_hash: passwordHash,
        verification_code: verificationCode,
        code_expires_at: codeExpiresAt,
      },
      update: {
        password_hash: passwordHash,
        verification_code: verificationCode,
        code_expires_at: codeExpiresAt,
      },
    });

    // Создаем временный токен для доступа к странице верификации
    const tempToken = await signJWT(
      { email, isPending: true },
      "1h", // Токен на 1 час
    );

    console.log('✅ Регистрация успешна:', email);
    console.log('🔑 Создан tempToken для:', email);
    console.log('📧 НОВЫЙ код верификации:', verificationCode);
    console.log('⏰ Код действителен до:', codeExpiresAt.toLocaleString('ru-RU'));

    // Устанавливаем только временный токен
    const response = NextResponse.json({
      success: true,
      email,
      verificationCode, // В продакшене отправлять на email
    });

    response.cookies.set('tempToken', tempToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 час
      path: '/',
    });

    console.log('🍪 tempToken cookie установлен');

    return response;
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
