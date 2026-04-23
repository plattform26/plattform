import jwt from 'jsonwebtoken';

// Misión Crítica: Bloquear el arranque si no hay secreto configurado
if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.trim() === '') {
  throw new Error('FATAL: NEXTAUTH_SECRET no configurado. La aplicación no puede iniciar sin una clave de firma segura.');
}

export const JWT_SECRET = process.env.NEXTAUTH_SECRET;

export interface JwtPayload {
  userId: string;
  role: string;
  email: string;
  name?: string;
  lastName?: string;
  expirationDate?: string | Date;
  pausedRemainingDays?: number;
  subscriptionStatus?: string;
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
    // Retornamos null en lugar de lanzar error para que el middleware maneje la redirección al login
    return null;
  }
}

