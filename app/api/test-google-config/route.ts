import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    clientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    expectedRedirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`,
    authUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google`,
  };

  return NextResponse.json({
    status: 'Google OAuth Configuration',
    config,
    instructions: {
      step1: 'Откройте: https://console.cloud.google.com/apis/credentials',
      step2: 'Найдите ваш OAuth Client ID',
      step3: 'Добавьте в "Authorized redirect URIs":',
      redirectUri: config.expectedRedirectUri,
      step4: 'Сохраните и подождите 30 секунд',
      step5: 'Попробуйте войти через Google',
    },
  });
}
