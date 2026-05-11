import { NextResponse } from 'next/server';

export async function GET() {
  const response = NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  
  // Удаляем все auth cookies
  response.cookies.delete('auth_token');
  response.cookies.delete('admin_token');
  response.cookies.delete('refresh_token');
  
  return response;
}
