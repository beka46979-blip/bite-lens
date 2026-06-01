'use server';

import { getAuthToken, getTempToken } from './cookies';
import { verifyJWT, JWTPayload } from './jwt';

export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getAuthToken();
  
  if (!token) {
    return null;
  }

  return verifyJWT(token);
}

export async function requireAuth(): Promise<JWTPayload> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

// Для pending регистраций (временный токен)
export async function getPendingUser(): Promise<{ email: string; isPending: boolean } | null> {
  const tempToken = await getTempToken();
  
  console.log('🔍 getPendingUser: tempToken =', tempToken ? 'найден' : 'не найден');
  
  if (!tempToken) {
    return null;
  }

  try {
    const payload = await verifyJWT(tempToken);
    console.log('🔓 JWT payload:', payload);
    
    if (payload.isPending && payload.email) {
      console.log('✅ Pending user найден:', payload.email);
      return { email: payload.email as string, isPending: true };
    }
    console.log('❌ Payload не содержит isPending или email');
    return null;
  } catch (error) {
    console.error('❌ Ошибка верификации JWT:', error);
    return null;
  }
}
