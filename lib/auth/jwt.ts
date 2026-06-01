import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production",
);

export interface JWTPayload {
  userId?: string;
  email: string;
  role?: string;
  isAdmin?: boolean;
  isEmailVerified?: boolean;
  isPending?: boolean;
  iat?: number;
  exp?: number;
}

export async function signJWT(
  payload: Partial<JWTPayload> & { email: string },
  expiresIn: string = "7d",
): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + parseExpiration(expiresIn);

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string | undefined,
      email: payload.email as string,
      role: payload.role as string | undefined,
      isAdmin: payload.isAdmin as boolean | undefined,
      isEmailVerified: payload.isEmailVerified as boolean | undefined,
      isPending: payload.isPending as boolean | undefined,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch (error) {
    return null;
  }
}

function parseExpiration(expiresIn: string): number {
  const unit = expiresIn.slice(-1);
  const value = parseInt(expiresIn.slice(0, -1));

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 60 * 60 * 24;
    default:
      return 60 * 60 * 24 * 7; // 7 days default
  }
}
