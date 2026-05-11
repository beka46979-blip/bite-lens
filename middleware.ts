import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './lib/auth/jwt';

const publicPaths = ['/', '/login', '/register', '/google-setup', '/forgot-password'];
const authPaths = ['/login', '/register'];
const verificationPath = '/verify-email';
const adminPublicPaths = ['/admin/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('🔍 Middleware:', pathname);
  
  // Пропускаем API routes и статические файлы
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Проверяем токены
  const userToken = request.cookies.get('auth_token')?.value;
  const adminToken = request.cookies.get('admin_token')?.value;
  
  console.log('🍪 Tokens:', { userToken: !!userToken, adminToken: !!adminToken });
  
  let user = null;
  let admin = null;

  try {
    user = userToken ? await verifyJWT(userToken) : null;
    admin = adminToken ? await verifyJWT(adminToken) : null;
    console.log('👤 Auth:', { user: !!user, admin: !!admin });
  } catch (error) {
    console.error('JWT verification error:', error);
  }

  // ========================================
  // ЗАЩИТА АДМИНСКИХ СТРАНИЦ
  // ========================================
  if (pathname.startsWith('/admin')) {
    // Страница логина доступна всем
    if (pathname === '/admin/login') {
      // Если админ уже авторизован, редирект на dashboard
      if (admin) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // Все остальные админские страницы требуют авторизации
    if (!admin) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
  }

  // ========================================
  // ЗАЩИТА ПОЛЬЗОВАТЕЛЬСКИХ СТРАНИЦ
  // ========================================
  
  // Публичные страницы
  if (publicPaths.includes(pathname)) {
    // Если пользователь авторизован и заходит на главную
    if (user && pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Если пользователь авторизован и заходит на auth страницы
    if (user && authPaths.includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Страница подтверждения email доступна авторизованным
  if (pathname === verificationPath && user) {
    return NextResponse.next();
  }

  // Все остальные страницы требуют авторизации
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
