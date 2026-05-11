'use server';

import { getAuthToken } from './cookies';
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
