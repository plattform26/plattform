import crypto from 'crypto';
import prisma from './prisma';

/**
 * Misión: Gestión de Tokens en Base de Datos
 * Este archivo centraliza la creación y búsqueda de tokens de seguridad.
 */

/**
 * Genera un token de verificación de email y lo guarda en la DB
 */
export async function generateVerificationToken(email: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Exira en 24h

  // Eliminar tokens previos para este email para evitar saturación
  await prisma.verificationToken.deleteMany({
    where: { email }
  });

  const verificationToken = await prisma.verificationToken.create({
    data: {
      email,
      token,
      expiresAt
    }
  });

  return verificationToken;
}

/**
 * Genera un token de restablecimiento de contraseña y lo guarda en la DB
 */
export async function generatePasswordResetToken(email: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Expira en 1h

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  // Eliminar tokens previos usados o expirados para este usuario
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id }
  });

  const passwordResetToken = await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt
    }
  });

  return passwordResetToken;
}

/**
 * Busca un token de verificación por valor
 */
export async function getVerificationTokenByToken(token: string) {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });
    return verificationToken;
  } catch {
    return null;
  }
}

/**
 * Busca un token de restablecimiento por valor
 */
export async function getPasswordResetTokenByToken(token: string) {
  try {
    const passwordResetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });
    return passwordResetToken;
  } catch {
    return null;
  }
}
