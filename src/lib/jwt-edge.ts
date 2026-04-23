import { jwtVerify } from 'jose';

// Misión Crítica: Bloquear el arranque si no hay secreto configurado
if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.trim() === '') {
  throw new Error('FATAL: NEXTAUTH_SECRET no configurado. La aplicación no puede iniciar sin una clave de firma segura.');
}

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

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

/**
 * Versión de verificación de JWT compatible con Edge Runtime (Middleware).
 * Utiliza la librería 'jose' en lugar de 'jsonwebtoken'.
 */
export async function verifyTokenEdge(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      algorithms: ['HS256']
    });
    return payload as unknown as JwtPayload;
  } catch (error) {
    // Retornamos null para que el middleware maneje la denegación (401 o redirección)
    return null;
  }
}
