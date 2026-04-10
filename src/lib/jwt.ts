import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'plattform-secret-2025';

export interface JwtPayload {
  userId: string;
  role: string;
  email: string;
  name?: string;
  lastName?: string;
}

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
