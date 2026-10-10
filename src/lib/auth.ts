import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';


const secretKey = process.env.SESSION_SECRET || 'super-secret-key-replace-me-in-production';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: import('jose').JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function decrypt(input: string): Promise<import('jose').JWTPayload> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload;
}

export async function login(adminId: string) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({ adminId, expires });
  
  // Save the session in a cookie
  (await cookies()).set('session', session, { expires, httpOnly: true, secure: process.env.NODE_ENV === 'production' });
}

export async function logout() {
  (await cookies()).set('session', '', { expires: new Date(0) });
}

export async function getSession(): Promise<{ adminId: string; expires: string | Date; [key: string]: unknown } | null> {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  try {
    return await decrypt(session) as { adminId: string; expires: string | Date; [key: string]: unknown };
  } catch {
    return null;
  }
}
