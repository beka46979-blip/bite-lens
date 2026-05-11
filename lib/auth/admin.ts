import { cookies } from 'next/headers';
import { verifyJWT } from './jwt';

export async function getCurrentAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return null;
    }

    const payload = await verifyJWT(token);

    if (!payload || !payload.isAdmin) {
      // Удаляем невалидный токен
      cookieStore.delete('admin_token');
      cookieStore.delete('admin_refresh_token');
      return null;
    }

    return {
      adminId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch (error) {
    // Удаляем невалидный токен при ошибке
    try {
      const cookieStore = await cookies();
      cookieStore.delete('admin_token');
      cookieStore.delete('admin_refresh_token');
    } catch (e) {
      // Игнорируем ошибки при удалении
    }
    return null;
  }
}
