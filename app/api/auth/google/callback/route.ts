import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signJWT } from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/cookies';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token: string;
}

interface GoogleUserInfo {
  id: string;  // Google использует "id" вместо "sub"
  sub?: string; // Опционально для совместимости
  email: string;
  verified_email?: boolean;
  email_verified?: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(new URL(`/login?error=google_${error}`, request.url));
  }

  if (!code) {
    console.error('No authorization code received');
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  try {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;

    console.log('Google OAuth callback:', {
      hasCode: !!code,
      hasClientId: !!googleClientId,
      hasClientSecret: !!googleClientSecret,
      redirectUri,
    });

    if (!googleClientId || !googleClientSecret) {
      throw new Error('Google OAuth not configured');
    }

    // Обмен кода на токен
    console.log('Exchanging code for token...');
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      throw new Error(`Failed to exchange code for token: ${errorData}`);
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json();
    console.log('Token received successfully');

    // Получение информации о пользователе
    console.log('Fetching user info...');
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      const errorData = await userInfoResponse.text();
      console.error('User info fetch failed:', errorData);
      throw new Error(`Failed to fetch user info: ${errorData}`);
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json();
    console.log('Full Google user data:', JSON.stringify(googleUser, null, 2));
    
    // Google использует "id" вместо "sub"
    const googleId = googleUser.sub || googleUser.id;
    
    console.log('User info received:', { 
      email: googleUser.email, 
      name: googleUser.name,
      googleId: googleId,
      picture: googleUser.picture 
    });

    if (!googleId || !googleUser.email) {
      console.error('Missing required Google user data:', googleUser);
      throw new Error('Invalid Google user data');
    }

    // Поиск или создание пользователя
    let user = await prisma.users.findUnique({
      where: { google_id: googleId },
    });

    if (!user) {
      // Проверяем, существует ли пользователь с таким email
      user = await prisma.users.findUnique({
        where: { email: googleUser.email },
      });

      if (user) {
        // Связываем существующий аккаунт с Google
        user = await prisma.users.update({
          where: { id: user.id },
          data: {
            google_id: googleId,
            name: user.name || googleUser.name,
            avatar: user.avatar || googleUser.picture,
            is_email_verified: true, // Email подтвержден через Google
          },
        });
      } else {
        // Создаем нового пользователя
        user = await prisma.users.create({
          data: {
            email: googleUser.email,
            google_id: googleId,
            name: googleUser.name,
            avatar: googleUser.picture,
            is_email_verified: true,
            onboarding_completed: false,
          },
        });
      }
    } else {
      // Обновляем информацию существующего пользователя
      user = await prisma.users.update({
        where: { id: user.id },
        data: {
          name: googleUser.name,
          avatar: googleUser.picture,
          last_login_at: new Date(),
        },
      });
    }

    // Создание токенов
    const token = await signJWT({ userId: user.id, email: user.email }, '7d');
    const refreshToken = await signJWT({ userId: user.id, email: user.email }, '30d');

    // Сохранение refresh token в БД
    await prisma.sessions.create({
      data: {
        id: crypto.randomUUID(),
        user_id: user.id,
        refresh_token: refreshToken,
        user_agent: request.headers.get('user-agent') || undefined,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Установка cookies
    await setAuthCookies(token, refreshToken);

    // Перенаправление в зависимости от статуса onboarding
    const redirectUrl = user.onboarding_completed ? '/dashboard' : '/profile';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
  }
}
