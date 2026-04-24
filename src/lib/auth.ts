import { cookies } from 'next/headers';
import { verifyToken, JwtPayload } from './jwt';

export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) return null;

  const decoded = verifyToken(token);
  return decoded;
}

export async function getUserRole(): Promise<string | null> {
  const session = await getSession();
  return session?.role || null;
}
