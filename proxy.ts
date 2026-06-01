import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "./lib/auth/jwt";

// Маршруты, доступные без авторизации
const publicPaths = [
  "/",
  "/login",
  "/register",
  "/google-setup",
  "/forgot-password",
  "/reset-password",
  "/force-logout",
];

// Маршруты, доступные только для НЕавторизованных
// (авторизованный будет перенаправлен на /dashboard)
const guestOnlyPaths = ["/login", "/register"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Пропускаем статические ресурсы
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Проверяем JWT-токены из куков
  const userToken = request.cookies.get("auth_token")?.value;
  const adminToken = request.cookies.get("admin_token")?.value;
  const tempToken = request.cookies.get("tempToken")?.value; // Для pending регистраций

  let user = null;
  let admin = null;
  let pendingUser = null;

  try {
    user = userToken ? await verifyJWT(userToken) : null;
    admin = adminToken ? await verifyJWT(adminToken) : null;
    pendingUser = tempToken ? await verifyJWT(tempToken) : null;
  } catch {
    // Невалидный токен — считаем пользователя неавторизованным
  }

  // ══════════════════════════════════════════════════════
  // ПРИНУДИТЕЛЬНАЯ ВЕРИФИКАЦИЯ EMAIL
  // ══════════════════════════════════════════════════════
  // Если пользователь вошёл, но не подтвердил email — держим его на /verify-email
  if (
    user &&
    user.isEmailVerified === false &&
    !pathname.startsWith("/verify-email") &&
    !pathname.startsWith("/admin") &&
    !publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))
  ) {
    return NextResponse.redirect(new URL("/verify-email", request.url));
  }

  // ══════════════════════════════════════════════════════
  // ЗАЩИТА АДМИНСКИХ СТРАНИЦ
  // ══════════════════════════════════════════════════════
  if (pathname.startsWith("/admin")) {
    // Страница входа для админов — публичная
    if (pathname === "/admin/login") {
      if (admin) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      return NextResponse.next();
    }

    // Все остальные /admin/* — только для авторизованных админов
    if (!admin) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  // ══════════════════════════════════════════════════════
  // ЗАЩИТА ПОЛЬЗОВАТЕЛЬСКИХ СТРАНИЦ
  // ══════════════════════════════════════════════════════

  const isPublicPath = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  if (isPublicPath) {
    // Авторизованный пользователь не должен видеть страницы входа/регистрации
    const isGuestOnly = guestOnlyPaths.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    );
    if (user && (pathname === "/" || isGuestOnly)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // /verify-email — доступна для авторизованных пользователей И для pending регистраций
  if (pathname.startsWith("/verify-email")) {
    // Разрешаем доступ если есть либо user, либо pendingUser
    if (!user && !pendingUser) {
      return NextResponse.redirect(new URL("/register", request.url));
    }
    return NextResponse.next();
  }

  // ══════════════════════════════════════════════════════
  // ВСЕ ОСТАЛЬНЫЕ МАРШРУТЫ — ТРЕБУЮТ АВТОРИЗАЦИИ
  // ══════════════════════════════════════════════════════
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Запускаем на всех маршрутах, кроме api и статики
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
