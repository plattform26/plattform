import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
}).strict();

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
}).strict();

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
}).strict();

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
}).strict();

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
}).strict();
